import { take, takeEvery, call, put, select } from '@redux-saga/core/effects';
import { channel } from '@redux-saga/core';
import { sign } from 'obyte/lib/internal';
import { oClient, getDeviceMessageHashToSign } from './../lib/OCustom';
import { actionTypes } from './../constants';
import { setExchangeRates } from './../actions/exchangeRates';
import {
  selectPermanentDeviceKeyObj,
  selectDeviceAddress,
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
  }
}

export function* loginToHub(challenge) {
  const permanentDeviceKey = yield select(selectPermanentDeviceKeyObj());

  const objLogin = { challenge, pubkey: permanentDeviceKey.pub_b64 };
  objLogin.signature = sign(
    getDeviceMessageHashToSign(objLogin),
    permanentDeviceKey.priv,
  );
  oClient.justsaying('hub/login', objLogin);

}

export function* rotateDeviceTempKey() {
  const ROTATION_PERIOD = 3600 * 1000;
}

export default function* watch() {
  yield takeEvery(actionTypes.DEVICE_TEMP_KEY_ROTATE, rotateDeviceTempKey);
  yield watchHubMessages();
}