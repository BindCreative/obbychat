import { take, takeEvery, call, put, select } from '@redux-saga/core/effects';
import { channel } from '@redux-saga/core';
import { sign } from 'obyte/lib/internal';
import { oClient, getDeviceMessageHashToSign } from './../lib/OCustom';
import { actionTypes } from './../constants';
import { setToastMessage } from './../actions/app';
import { setExchangeRates } from './../actions/exchangeRates';
import {
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
  objTempPubkey.signature = sign(getDeviceMessageHashToSign(objTempPubkey), permanentDeviceKey.priv);
  oClient.api.tempPubkey(objTempPubkey)
    .then(result => console.log('Temp pubkey result', result))
    .catch(e => console.log('Temp pubkey error', e));

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
  try {
    while (true) {
      const { type, payload } = yield take(oChannel);
      
      if (type === 'justsaying') {
        switch (payload.subject) {
          case 'hub/challenge':
            yield call(loginToHub, payload.body);
          case 'hub/message':
            console.log('TODO - parse message');
          case 'exchange_rates':
            yield put(setExchangeRates(payload));
          default:
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
}

export default function* watch() {
  yield watchHubMessages();
}