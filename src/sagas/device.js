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
  addMessageSuccess,
  addMessageFail,
  receiveMessageStart,
  receiveMessageSuccess,
  receiveMessageFail,
  setUnreadMessages,
} from '../actions/messages';
import { setExchangeRates } from './../actions/exchangeRates';
import { selectCorrespondent } from './../selectors/messages';
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
    yield call(
      setInterval,
      () => {
        oClient.api.heartbeat();
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
      // console.log('HUB MESSAGE', { type, payload });
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
      const correspondent = {
        address: decryptedMessage.from,
        name: decryptedMessage.body.device_name,
        hub: decryptedMessage.device_hub,
        pubKey: body.message.pubkey,
        pairingSecret: decryptedMessage.body.pairing_secret,
        reversePairingSecret: decryptedMessage.body.reverse_pairing_secret,
      };
      yield put(addCorrespondent(correspondent));
      yield call(NavigationService.back);
      yield call(NavigationService.navigate, 'Chat', {
        correspondent,
      });
      oClient.justsaying('hub/delete', body.message_hash);
      // Navigate
    } else if (decryptedMessage.subject === 'text') {
      // Check if signed message with wallet address info
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
    console.log('UNHANDLED ERROR: ', error);
  }
}

// TODO: send pairing message
export function* acceptInvitation(action) {
  let address, pubKey, hub, pairingSecret;

  const { data } = action.payload;
  const pairingData = data.replace(
    REGEX_PAIRING,
    (str, protocol, cPubKey, cHub, cPairingSecret) => {
      address = getDeviceAddress(cPubKey);
      pubKey = cPubKey;
      hub = cHub;
      pairingSecret = cPairingSecret;
    },
  );

  if (address) {
    yield put(
      addCorrespondent({
        address,
        pubKey,
        hub,
        pairingSecret,
        name: 'New',
      }),
    );
    const correspondent = yield select(selectCorrespondent(address));
    yield call(NavigationService.navigate, 'Chat', { correspondent });
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

export default function* watch() {
  yield all([
    watchHubMessages(),
    takeEvery(actionTypes.MESSAGE_ADD_START, sendMessage),
    takeEvery(actionTypes.MESSAGE_RECEIVE_START, handleReceivedMessage),
    takeEvery(actionTypes.CORRESPONDENT_INVITATION_ACCEPT, acceptInvitation),
  ]);
}
