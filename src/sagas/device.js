import _ from 'lodash';
import {
  take,
  takeEvery,
  call,
  put,
  select,
  all,
} from '@redux-saga/core/effects';
import { channel } from '@redux-saga/core';
import { isValidAddress } from 'obyte/lib/utils';
import DeviceInfo from 'react-native-device-info';
import Crypto from 'crypto';

import NavigationService from './../navigation/service';
import { actionTypes } from '../constants';
import { REGEX_SIGNED_MESSAGE, REGEX_PAIRING } from './../lib/messaging';
import {
  sign,
  oClient,
  hubAddress,
  decryptPackage,
  getBase64Hash,
  getTempPubKey,
  createEncryptedPackage,
  getDeviceMessageHashToSign,
  deliverMessage,
  getSignedMessageInfoFromJsonBase64,
  getDeviceAddress,
} from './../lib/oCustom';
import { setToastMessage } from './../actions/app';
import {
  addCorrespondent,
  removeCorrespondent,
  updateCorrespondentWalletAddress,
} from '../actions/correspondents';
import {
  addMessageStart,
  addMessageSuccess,
  addMessageFail,
  receiveMessageStart,
  receiveMessageSuccess,
  receiveMessageFail,
  setUnreadMessages,
} from '../actions/messages';
import { setExchangeRates } from './../actions/exchangeRates';
import { rotateDeviceTempKey } from '../actions/device';
import { selectCorrespondent } from './../selectors/messages';
import {
  selectDeviceAddress,
  selectPermanentDeviceKeyObj,
  selectDeviceTempKeyData,
  selectDevicePubKey,
} from './../selectors/device';

let oChannel;

if (!oChannel) {
  oChannel = channel();
}

export function* loginToHub(challenge) {
  const permanentDeviceKey = yield select(selectPermanentDeviceKeyObj());
  const tempDeviceKeyData = yield select(selectDeviceTempKeyData());

  const objLogin = { challenge, pubkey: permanentDeviceKey.pubB64 };
  objLogin.signature = sign(
    getDeviceMessageHashToSign(objLogin),
    permanentDeviceKey.priv,
  );
  oClient.justsaying('hub/login', objLogin);

  const objTempPubkey = {
    temp_pubkey: tempDeviceKeyData.pubB64,
    pubkey: permanentDeviceKey.pubB64,
  };
  objTempPubkey.signature = sign(
    getDeviceMessageHashToSign(objTempPubkey),
    permanentDeviceKey.priv,
  );
  oClient.api
    .tempPubkey(objTempPubkey)
    .then(result => console.log('Temp pubkey result:', result))
    .catch(e => console.log('Temp pubkey error:', e));

  oClient.justsaying('hub/refresh', null);
}

export function* subscribeToHub() {
  try {
    yield oClient.subscribe((err, result) => {
      if (err) {
        throw new Error('Hub socket error');
      } else {
        const [type, payload] = result;
        oChannel.put({ type, payload });
      }
    });
    yield call(
      setInterval,
      () => {
        oClient.api.heartbeat();
        console.log('HB to hub');
      },
      10000,
    );
  } catch (error) {
    yield put(
      setToastMessage({
        type: 'ERROR',
        message: 'Hub connection error',
      }),
    );
    console.log(error);
  }
}

export function* watchHubMessages() {
  try {
    while (true) {
      const { type, payload } = yield take(oChannel);
      console.log('HUB MESSAGE', { type, payload });
      if (type === 'justsaying') {
        if (payload.subject === 'hub/challenge') {
          yield call(loginToHub, payload.body);
        } else if (payload.subject === 'hub/message') {
          yield receiveMessage(payload);
        } else if (payload.subject === 'exchange_rates') {
          yield put(setExchangeRates(payload.body));
        } else if (
          payload.subject === 'info' &&
          /^(\d+) messages? sent$/.test(payload?.body)
        ) {
          yield put(
            setUnreadMessages(
              parseInt(/^(\d+) messages? sent$/.exec(payload.body)[1]),
            ),
          );
        }
      } else if (type === 'request') {
        console.log('UNHANDLED REQUEST FROM HUB: ', payload);
      } else {
        console.log('UNHANDLED PACKAGE FROM HUB: ', type, payload);
      }
    }
  } catch (error) {
    console.log(error);
  }
}

export function* receiveMessage(message) {
  const { body } = message;
  const tempDeviceKey = yield select(selectDeviceTempKeyData());
  const permDeviceKey = yield select(selectPermanentDeviceKeyObj());

  try {
    const decryptedMessage = yield call(
      decryptPackage,
      body.message.encrypted_package,
      permDeviceKey,
      tempDeviceKey,
    );

    if (decryptedMessage.subject === 'removed_paired_device') {
      yield put(removeCorrespondent({ address: decryptedMessage.from }));
      oClient.justsaying('hub/delete', body.message_hash);
    } else if (decryptedMessage.subject === 'pairing') {
      const myDeviceAddress = yield select(selectDeviceAddress());
      const reversePairingSecret = Crypto.randomBytes(9).toString('base64');
      const correspondent = {
        address: decryptedMessage.from,
        name: decryptedMessage.body.device_name,
        hub: decryptedMessage.device_hub,
        pubKey: body.message.pubkey,
        pairingSecret: decryptedMessage.body.pairing_secret,
        reversePairingSecret:
          decryptedMessage.body.reverse_pairing_secret ?? reversePairingSecret,
      };
      yield put(addCorrespondent(correspondent));
      yield call(sendPairingMessage, {
        reversePairingSecret,
        hub: hubAddress,
        address: myDeviceAddress,
        pairingSecret: correspondent.reversePairingSecret,
        devicePubkey: permDeviceKey.pubB64,
      });

      oClient.justsaying('hub/delete', body.message_hash);
      // Navigate
    } else if (decryptedMessage.subject === 'text') {
      // Check if signed message with wallet address info
      yield call(checkForSigning, decryptedMessage);
      // Persist the message
      yield put(
        receiveMessageStart({
          address: decryptedMessage.from,
          messageType: decryptedMessage.subject,
          message: decryptedMessage.body,
          messageHash: body.message_hash,
          handleAs: 'RECEIVED',
          hub: decryptedMessage.device_hub,
          timestamp: Date.now(),
        }),
      );
    } else if (decryptedMessage.subject === 'payment_notification') {
      oClient.justsaying('hub/delete', body.message_hash);
    }
  } catch (error) {
    console.log('MESSAGE PARSING ERROR:', {
      message: message.body.message,
    });
    if (error === 'INVALID_DECRYPTION_KEY') {
      oClient.justsaying('hub/delete', message.body.message_hash);
    }
  }
}

export function* sendMessage(action) {
  try {
    const myPermKeys = yield select(selectPermanentDeviceKeyObj());
    const myDeviceAddress = yield select(selectDeviceAddress());
    const {
      pubKey: recipientPubKey,
      address: recipientAddress,
      message,
    } = action.payload;

    const packageObj = {
      from: myDeviceAddress,
      device_hub: hubAddress,
      subject: 'text',
      body: message,
    };
    const encryptedPackage = createEncryptedPackage(
      packageObj,
      recipientPubKey,
    );

    const deviceMessage = {
      encrypted_package: encryptedPackage,
    };
    const messageHash = getBase64Hash(deviceMessage);
    const tempPubKeyData = yield getTempPubKey(recipientPubKey);

    const objEncryptedPackage = createEncryptedPackage(
      packageObj,
      tempPubKeyData.temp_pubkey,
    );
    const objDeviceMessage = {
      encrypted_package: objEncryptedPackage,
      to: recipientAddress,
      pubkey: myPermKeys.pubB64,
    };
    objDeviceMessage.signature = sign(
      getDeviceMessageHashToSign(objDeviceMessage),
      myPermKeys.priv,
    );
    yield deliverMessage(objDeviceMessage);
    yield put(
      addMessageSuccess({
        message,
        messageHash,
        address: recipientAddress,
        messageType: 'text',
        timestamp: Date.now(),
      }),
    );
  } catch (error) {
    yield put(addMessageFail());
    console.log('UNHANDLED ERROR: ', error);
  }
}

// Handles incoming chat messages
export function* handleReceivedMessage(action) {
  try {
    yield put(receiveMessageSuccess(action.payload));
    oClient.justsaying('hub/delete', action.payload.messageHash);
  } catch (error) {
    yield put(receiveMessageFail());
  }
}

export function* acceptInvitation(action) {
  let correspondentDeviceAddress, pubKey, hub, pairingSecret;

  const { data } = action.payload;
  data.replace(
    REGEX_PAIRING,
    (
      str,
      protocol,
      correspondentPubKey,
      correspondentHub,
      correspondentPairingSecret,
    ) => {
      correspondentDeviceAddress = getDeviceAddress(correspondentPubKey);
      pubKey = correspondentPubKey;
      hub = correspondentHub;
      pairingSecret = correspondentPairingSecret;
    },
  );

  if (correspondentDeviceAddress) {
    yield put(
      addCorrespondent({
        address: correspondentDeviceAddress,
        pubKey,
        hub,
        pairingSecret,
        name: 'New',
      }),
    );

    yield call(sendPairingMessage, {
      hub,
      address: correspondentDeviceAddress,
      pairingSecret,
      reversePairingSecret: Crypto.randomBytes(9).toString('base64'),
      devicePubkey: pubKey,
    });
    yield put(rotateDeviceTempKey());
    yield call(NavigationService.navigate, 'ChatList');
  } else {
    yield put(
      setToastMessage({
        type: 'ERROR',
        message: 'Unable to accept invitation',
      }),
    );
    yield call(NavigationService.back, 'ChatList');
  }
}

export function* checkForSigning(decryptedMessage) {
  let walletAddress;
  decryptedMessage.body.replace(
    REGEX_SIGNED_MESSAGE,
    (str, description, signedMessageBase64) => {
      const info = getSignedMessageInfoFromJsonBase64(signedMessageBase64);
      walletAddress = info.objSignedMessage.authors[0].address ?? null;
    },
  );

  if (isValidAddress(walletAddress)) {
    yield put(
      updateCorrespondentWalletAddress({
        address: decryptedMessage.from,
        walletAddress,
      }),
    );
  }
}

export function* sendPairingMessage({
  address,
  hub,
  pairingSecret,
  reversePairingSecret,
  devicePubkey,
}) {
  try {
    const myPermKeys = yield select(selectPermanentDeviceKeyObj());
    const myDeviceAddress = yield select(selectDeviceAddress());
    const myDeviceName = yield call(DeviceInfo.getDeviceName);
    // TODO: get device name
    let body = { pairing_secret: pairingSecret, device_name: myDeviceName };
    if (reversePairingSecret) {
      body.reverse_pairing_secret = reversePairingSecret;
    }
    const packageObj = {
      from: myDeviceAddress,
      device_hub: hub,
      subject: 'pairing',
      body: body,
    };
    const encryptedPackage = createEncryptedPackage(packageObj, devicePubkey);
    const deviceMessage = {
      encrypted_package: encryptedPackage,
    };
    const messageHash = getBase64Hash(deviceMessage);
    const tempPubKeyData = yield getTempPubKey(devicePubkey);

    const objEncryptedPackage = createEncryptedPackage(
      packageObj,
      tempPubKeyData.temp_pubkey,
    );
    const objDeviceMessage = {
      encrypted_package: objEncryptedPackage,
      to: address,
      pubkey: myPermKeys.pubB64,
    };
    objDeviceMessage.signature = sign(
      getDeviceMessageHashToSign(objDeviceMessage),
      myPermKeys.priv,
    );
    yield deliverMessage(objDeviceMessage);
  } catch (e) {
    console.log('sendPairingMessage failed', JSON.stringify(e));
  }
}

export default function* watch() {
  yield all([
    watchHubMessages(),
    takeEvery(actionTypes.MESSAGE_ADD_START, sendMessage),
    takeEvery(actionTypes.MESSAGE_RECEIVE_START, handleReceivedMessage),
    takeEvery(actionTypes.CORRESPONDENT_INVITATION_ACCEPT, acceptInvitation),
  ]);
}
