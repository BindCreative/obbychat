import _ from 'lodash';
import {
  take,
  takeEvery,
  call,
  put,
  select,
  all,
  delay,
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
  setCorrespondentName,
} from '../actions/correspondents';
import {
  addMessageSuccess,
  addMessageFail,
  receiveMessageStart,
  receiveMessageSuccess,
  receiveMessageFail,
  setUnreadMessages,
} from '../actions/messages';
import { setExchangeRates } from './../actions/exchangeRates';
import { selectCorrespondentByPairingSecret } from './../selectors/messages';
import {
  selectDeviceAddress,
  selectPermanentDeviceKeyObj,
  selectDeviceTempKeyData,
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
  } catch (error) {
    yield put(
      setToastMessage({
        type: 'ERROR',
        message: 'Hub connection error',
      }),
    );
  }
}

export function* watchHubMessages() {
  try {
    while (true) {
      const { type, payload } = yield take(oChannel);
      if (type === 'justsaying') {
        if (payload.subject === 'hub/challenge') {
          yield call(loginToHub, payload.body);
        } else if (payload.subject === 'hub/message') {
          yield call(receiveMessage, payload);
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
        // console.log('UNHANDLED REQUEST FROM HUB: ', payload);
      } else {
        // console.log('UNHANDLED PACKAGE FROM HUB: ', type, payload);
      }
    }
  } catch (error) {
    // (error);
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
      const existingCorrespondent = yield select(
        selectCorrespondentByPairingSecret(
          decryptedMessage.body.pairing_secret,
        ),
      );
      const reversePairingSecret =
        decryptedMessage.body?.reverse_pairing_secret;
      console.log('checks', existingCorrespondent, reversePairingSecret);
      if (!reversePairingSecret && !existingCorrespondent) {
        // Correspondent started adding you
        const correspondent = {
          address: decryptedMessage.from,
          name: decryptedMessage.body.device_name,
          hub: decryptedMessage.device_hub,
          pubKey: body.message.pubkey,
          pairingSecret: decryptedMessage.body.pairing_secret,
        };
        yield put(addCorrespondent(correspondent));
        yield call(sendPairingMessage, {
          reversePairingSecret,
          hub: correspondent.hub,
          address: correspondent.address,
          pairingSecret: correspondent.pairingSecret,
          recipientPubKey: body.message.pubkey,
        });
      } else if (!existingCorrespondent && reversePairingSecret) {
        // I send pairing confirmation
        const correspondent = {
          address: decryptedMessage.from,
          name: decryptedMessage.body.device_name,
          hub: decryptedMessage.device_hub,
          pubKey: body.message.pubkey,
          pairingSecret: decryptedMessage.body.pairing_secret,
          reversePairingSecret,
        };
        yield put(addCorrespondent(correspondent));
        yield call(sendPairingMessage, {
          reversePairingSecret,
          hub: correspondent.hub,
          address: correspondent.address,
          pairingSecret: reversePairingSecret,
          recipientPubKey: body.message.pubkey,
        });
      } else if (
        !reversePairingSecret &&
        existingCorrespondent?.reversePairingSecret ===
          decryptedMessage.body.pairing_secret
      ) {
        // Correspondent sends pairing confirmation
        yield put(
          setCorrespondentName({
            address: decryptedMessage.from,
            name: decryptedMessage.body.device_name ?? 'New',
          }),
        );
      }
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
      error,
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
    yield call(deliverMessage, objDeviceMessage);
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
  let cDeviceAddress, cPubKey, cHub, pairingSecret;
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
      cDeviceAddress = getDeviceAddress(correspondentPubKey);
      cPubKey = correspondentPubKey;
      cHub = correspondentHub;
      pairingSecret = correspondentPairingSecret;
    },
  );

  if (cDeviceAddress) {
    const reversePairingSecret = Crypto.randomBytes(9).toString('base64');
    yield put(
      addCorrespondent({
        hub: cHub,
        pubKey: cPubKey,
        pairingSecret,
        reversePairingSecret,
        address: cDeviceAddress,
        name: 'New',
      }),
    );

    yield call(sendPairingMessage, {
      pairingSecret,
      reversePairingSecret,
      address: cDeviceAddress,
      recipientPubKey: cPubKey,
      hub: cHub,
    });
    yield call(NavigationService.navigate, 'ChatList');
  } else {
    yield put(
      setToastMessage({
        type: 'ERROR',
        message: 'Unable to accept invitation',
      }),
    );
    yield call(NavigationService.navifate, 'ChatList');
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
  hub,
  address,
  pairingSecret,
  reversePairingSecret,
  recipientPubKey,
}) {
  try {
    const myPermKeys = yield select(selectPermanentDeviceKeyObj());
    const myDeviceAddress = yield select(selectDeviceAddress());
    const myDeviceName = yield call(DeviceInfo.getDeviceName);

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

    const encryptedPackage = createEncryptedPackage(
      packageObj,
      recipientPubKey,
    );

    const tempPubKeyData = yield getTempPubKey(recipientPubKey);

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

export function* startHubHeartbeat() {
  while (true) {
    yield delay(10000);
    yield call(oClient.api.heartbeat);
  }
}

export default function* watch() {
  yield all([
    watchHubMessages(),
    takeEvery(actionTypes.MESSAGE_ADD_START, sendMessage),
    takeEvery(actionTypes.MESSAGE_RECEIVE_START, handleReceivedMessage),
    takeEvery(actionTypes.CORRESPONDENT_INVITATION_ACCEPT, acceptInvitation),
    takeEvery(actionTypes.WALLET_INIT_SUCCESS, startHubHeartbeat),
  ]);
}
