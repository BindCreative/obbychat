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

import NavigationService from './../navigation/service';
import { actionTypes } from '../constants';
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
} from './../lib/oCustom';
import { setToastMessage } from './../actions/app';
import {
  addMessageSuccess,
  addMessageFail,
  receiveMessageStart,
  receiveMessageSuccess,
  receiveMessageFail,
  setUnreadMessages,
  addCorrespondent,
  removeCorrespondent,
} from '../actions/messages';
import { setExchangeRates } from './../actions/exchangeRates';
import {
  selectDeviceAddress,
  selectPermanentDeviceKeyObj,
  selectDeviceTempKeyData,
} from './../selectors/device';
import { selectCorrespondent } from '../selectors/messages';

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
    console.log('subscribe');
    yield oClient.subscribe((err, result) => {
      if (err) {
        throw new Error('Hub socket error');
      } else {
        const [type, payload] = result;
        oChannel.put({ type, payload });
      }
    });
    const hb = yield call(
      setInterval,
      () => {
        oClient.api.heartbeat();
        console.log('Heartbeat');
      },
      10000,
    );
  } catch (error) {
    yield setTimeout(() => subscribeToHub(), 5000);
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
      if (type === 'justsaying') {
        if (payload.subject === 'hub/challenge') {
          yield call(loginToHub, payload.body);
        } else if (payload.subject === 'hub/message') {
          yield receiveMessage(payload);
        } else if (payload.subject === 'exchange_rates') {
          yield put(setExchangeRates(payload));
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
    const decryptedMessage = decryptPackage(
      body.message.encrypted_package,
      permDeviceKey,
      tempDeviceKey,
    );
    console.log('ENCRYPTED MESSAGE: ', message);
    console.log('DECRYPTED MESSAGE: ', decryptedMessage);

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

export default function* watch() {
  yield all([
    watchHubMessages(),
    takeEvery(actionTypes.MESSAGE_ADD_START, sendMessage),
    takeEvery(actionTypes.MESSAGE_RECEIVE_START, handleReceivedMessage),
  ]);
}
