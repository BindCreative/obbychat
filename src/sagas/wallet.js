import { takeLatest, call, put, select } from '@redux-saga/core/effects';
import Mnemonic from 'bitcore-mnemonic';
import NavigationService from './../navigation/service';
import { oClient } from './../lib/oCustom';
import { actionTypes } from './../constants';
import { subscribeToHub } from './device';
import { setToastMessage } from './../actions/app';
import { rotateDeviceTempKey } from '../actions/device';
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
import {
  loadWalletBalancesSuccess,
  loadWalletBalancesFail,
} from './../actions/balances';
import {
  selectWallet,
  selectWalletAddress,
  selectWitnesses,
  selectAddressWif,
} from './../selectors/wallet';

export function* initWallet() {
  try {
    yield put(rotateDeviceTempKey());
    const walletData = yield select(selectWallet());
    if (walletData.password === null || walletData.seedWords === null) {
      yield put(createInitialWalletStart());
    }

    // Handle websocket traffic
    yield call(subscribeToHub);
    // Fetch wallet data from hub
    yield call(fetchBalances);
    yield call(fetchWitnesses);
    yield put(loadWalletHistory());
    yield put(initWalletSuccess());
    walletInitiated = true;
  } catch (error) {
    yield put(initWalletFail());
    yield put(
      setToastMessage({
        type: 'ERROR',
        message: 'Unable to init wallet.',
      }),
    );
  }
}

export function* createInitialWallet(action) {
  try {
    const password = '';
    let mnemonic = new Mnemonic();
    while (!Mnemonic.isValid(mnemonic.toString())) {
      mnemonic = new Mnemonic();
    }

    yield put(
      createInitialWalletSuccess({
        password,
        seedWords: mnemonic.phrase,
      }),
    );
  } catch (error) {
    console.log(error);
    yield put(createInitialWalletFail());
    yield put(
      setToastMessage({
        type: 'ERROR',
        message: 'Unable to generate new wallet.',
      }),
    );
  }
}

export function* fetchBalances(action) {
  try {
    const walletAddress = yield select(selectWalletAddress());
    console.log('WALLET ADDRESS: ', walletAddress);
    const balances = yield call(oClient.api.getBalances, [walletAddress]);
    yield put(loadWalletBalancesSuccess(balances));
  } catch (error) {
    yield put(loadWalletBalancesFail());
    yield put(
      setToastMessage({
        type: 'ERROR',
        message: 'Unable to fetch balances.',
      }),
    );
    console.log(error);
  }
}

export function* fetchWitnesses(action) {
  try {
    const witnessesPromise = new Promise((resolve, reject) =>
      oClient.api.getWitnesses((err, witnesses) => {
        if (err) {
          reject(err);
        } else {
          resolve(witnesses);
        }
      }),
    );
    const witnesses = yield witnessesPromise;
    yield put(getWitnessesSuccess(witnesses));
  } catch (error) {
    console.log({ error });
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

    const historyPromise = new Promise((resolve, reject) =>
      oClient.api.getHistory(params, (err, history) => {
        if (err) {
          reject(err);
        } else {
          resolve(history);
        }
      }),
    );
    const history = yield historyPromise;
    yield put(loadWalletHistorySuccess(history));
  } catch (error) {
    yield put(loadWalletHistoryFail());
    yield put(
      setToastMessage({
        type: 'ERROR',
        message: 'Unable to fetch transactions.',
      }),
    );
    console.log({ error });
  }
}

export function* sendPayment(action) {
  try {
    const walletWif = yield select(selectAddressWif());
    const params = {
      ...action.payload,
    };

    yield call(oClient.post.payment, params, walletWif);
    yield call(fetchBalances, action);
    yield call(fetchWalletHistory, action);
    yield call(NavigationService.navigate('Wallet'));
    yield put(sendPaymentSuccess());
    yield put(
      setToastMessage({
        type: 'SUCCESS',
        message: 'Transaction completed',
      }),
    );
  } catch (error) {
    yield put(sendPaymentFail());
    yield put(
      setToastMessage({
        type: 'ERROR',
        message: 'Unable to send payment',
      }),
    );
    console.log({ error });
  }
}

export default function* watch() {
  yield takeLatest(actionTypes.WALLET_INIT_START, initWallet);
  yield takeLatest(
    actionTypes.INITIAL_WALLET_CREATE_START,
    createInitialWallet,
  );
  yield takeLatest(actionTypes.WALLET_BALANCES_FETCH_START, fetchBalances);
  yield takeLatest(actionTypes.WALLET_HISTORY_GET_START, fetchWalletHistory);
  yield takeLatest(actionTypes.PAYMENT_SEND_START, sendPayment);
}
