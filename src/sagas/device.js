import { take, takeEvery, call, put, select } from '@redux-saga/core/effects';
import { channel } from '@redux-saga/core';
import { sign } from 'obyte/lib/internal';
import { oClient, getDeviceMessageHashToSign } from './../lib/OCustom';
import { actionTypes } from './../constants';
import { setExchangeRates } from './../actions/exchangeRates';
import {
  selectDeviceAddress,
  selectPermanentDeviceKeyObj,
  selectDeviceTempKeyData,
} from './../selectors/device';


export const oChannel = channel();

export function* subscribeToHub() {
  try {
    oClient.subscribe((err, result) => {
      if (err) {
        throw new Error('Hub socket error');
      } else {
        const [messageType, message] = result;
        oChannel.put({ type: messageType, payload: message });
      }
    });
    yield call(setInterval, () => oClient.api.heartbeat(), 10 * 1000);
  } catch (error) {
    yield put(setToastMessage({
      type: 'ERROR',
      message: 'Hub connection error',
    }));
    console.log(error);
  }
}

export function* watchHubMessages() {
  while (true) {
    const { type, payload } = yield take(oChannel)

    if (type === 'justsaying') {
      switch (payload.subject) {
        case 'hub/challenge':
          yield call(loginToHub, payload.body);
          return;
        default:
          console.log(payload.body);
      }
    }
    console.log(type, payload);
  }
}

export function* loginToHub(challenge) {
  const deviceAddress = yield select(selectDeviceAddress());
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
  objTempPubkey.signature = sign(getDeviceMessageHashToSign(objTempPubkey), permanentDeviceKey.priv);
  oClient.api.tempPubkey(objTempPubkey)
    .then(result => console.log('Temp pubkey result', result))
    .catch(e => console.log('Temp pubkey error', e));

  oClient.justsaying('hub/refresh', null);
}

export default function* watch() {
  yield watchHubMessages();
}