import { takeLatest, takeEvery, call, put, take, select } from '@redux-saga/core/effects';
import { channel } from '@redux-saga/core';
import Mnemonic from 'bitcore-mnemonic';
import Crypto from 'crypto';
import { sign } from 'obyte/lib/internal';
import NavigationService from './../navigation/service';
import { oClient, testnet } from './../lib/Wallet';
import { getDeviceMessageHashToSign } from './../lib/OCustom';
import { actionTypes } from './../constants';
import { setToastMessage } from './../actions/app';
import {
  createInitialWalletStart,
  createInitialWalletSuccess,
  createInitialWalletFail,
  getWitnessesSuccess,
  initWalletFail,
  initWalletSuccess,
  sendPaymentSuccess,
  sendPaymentFail,
} from './../actions/wallet';
import {
  loadWalletHistory,
  loadWalletHistorySuccess,
  loadWalletHistoryFail,
} from '../actions/walletHistory';
import { setExchangeRates } from './../actions/exchangeRates';
import {
  loadWalletBalancesSuccess,
  loadWalletBalancesFail,
} from './../actions/balances';
import {
  selectWallet,
  selectWalletAddress,
  selectWalletWif,
  selectWitnesses,
  selectPermanentDeviceKeyObj,
} from './../selectors/wallet';


export const oChannel = channel();

export function* initWallet(action) {
  try {
    const walletData = yield select(selectWallet());
    if (walletData.password === null || walletData.seedWords === null) {
      yield put(createInitialWalletStart());
    }

    // Handle websocket traffic
    yield call(subscribeToHub, action);
    // Fetch wallet data from hub
    yield call(fetchBalances, action);
    yield call(fetchWitnesses, action);
    yield call(fetchWalletHistory, action);
    yield put(initWalletSuccess({}));
  } catch (error) {
    yield put(initWalletFail());
    yield put(setToastMessage({
      type: 'ERROR',
      message: 'Unable to init wallet.',
    }));
    console.log(error);
  }
}

export function* createInitialWallet(action) {
  try {
    const password = '';
    let mnemonic = new Mnemonic();
    while (!Mnemonic.isValid(mnemonic.toString())) {
      mnemonic = new Mnemonic();
    }

    yield put(createInitialWalletSuccess({
      password,
      seedWords: mnemonic.phrase,
    }));
  } catch (error) {
    console.log(error);
    yield put(createInitialWalletFail());
    yield put(setToastMessage({
      type: 'ERROR',
      message: 'Unable to generate new wallet.',
    }));
  }
}

export function* fetchBalances(action) {
  try {
    const walletAddress = yield select(selectWalletAddress());
    const balances = yield call(oClient.api.getBalances, [walletAddress]);
    yield put(loadWalletBalancesSuccess(balances));
  } catch (error) {
    yield put(loadWalletBalancesFail());
    yield put(setToastMessage({
      type: 'ERROR',
      message: 'Unable to fetch balances.',
    }));
    console.log(error);
  }
}

export function* fetchWitnesses(action) {
  try {
    const witnessesPromise = new Promise((resolve, reject) => oClient.api.getWitnesses((err, witnesses) => {
      if (err) {
        reject(err);
      } else {
        resolve(witnesses);
      }
    }));
    const witnesses = yield witnessesPromise;
    yield put(getWitnessesSuccess(witnesses));
  } catch (error) {
    console.log(error);
  }
}

export function* fetchWalletHistory(action) {
  try {
    const witnesses = yield select(selectWitnesses());
    const walletAddress = yield select(selectWalletAddress());
    const params = {
      witnesses: witnesses,
      addresses: [walletAddress],
    };

    const historyPromise = new Promise((resolve, reject) => oClient.api.getHistory(params, (err, history) => {
      if (err) {
        reject(err);
      } else {
        resolve(history);
      }
    }));
    const history = yield historyPromise;
    yield put(loadWalletHistorySuccess(history));
  } catch (error) {
    yield put(loadWalletHistoryFail());
    yield put(setToastMessage({
      type: 'ERROR',
      message: 'Unable to fetch transactions.',
    }));
    console.log(error);
  }
}

export function* sendPayment(action) {
  try {
    const walletWif = yield select(selectWalletWif());
    const params = {
      ...action.payload
    };

    yield call(oClient.post.payment, params, walletWif);
    yield call(fetchBalances, action);
    yield call(fetchWalletHistory, action);
    yield call(NavigationService.back);
    yield put(sendPaymentSuccess());
    yield put(setToastMessage({
      type: 'SUCCESS',
      message: 'Transaction completed'
    }));
  } catch (error) {
    yield put(sendPaymentFail());
    yield put(setToastMessage({
      type: 'ERROR',
      message: 'Unable to send payment',
    }));
    console.log(error);
  }
}

export function* subscribeToHub(action) {
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
  const deviceTempPrivKey = Crypto.randomBytes(32);
  const devicePrevTempPrivKey = Crypto.randomBytes(32);

  const objLogin = { challenge, pubkey: permanentDeviceKey.pub_b64 };
  objLogin.signature = sign(
    getDeviceMessageHashToSign(objLogin),
    permanentDeviceKey.priv,
  );
  oClient.justsaying('hub/login', objLogin);

}

export default function* walletSagas() {
  yield takeLatest(actionTypes.WALLET_INIT_START, initWallet);
  yield takeLatest(actionTypes.INITIAL_WALLET_CREATE_START, createInitialWallet);
  yield takeLatest(actionTypes.WALLET_BALANCES_FETCH_START, fetchBalances);
  yield takeEvery(actionTypes.PAYMENT_SEND_START, sendPayment);
  yield watchHubMessages();
}
