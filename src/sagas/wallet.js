import { takeLatest, takeEvery, call, put, select, delay } from '@redux-saga/core/effects';
import Mnemonic from 'bitcore-mnemonic';
import { toWif, getChash160 } from 'obyte/lib/utils';
import NavigationService from './../navigation/service';
import { oClient, testnet } from './../lib/Wallet';
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
import { selectWallet } from './../selectors/wallet';


export function* initWallet(action) {
  try {
    const walletData = yield select(selectWallet());
    if (walletData.addresses.length < 1) {
      // New wallet
      yield put(createInitialWalletStart());
    }

    // Handle websocket traffic
    yield call(subscribeToHub, action);
    yield call(heartbeatToHub, action);
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
    let mnemonic = new Mnemonic();
    while (!Mnemonic.isValid(mnemonic.toString())) {
      mnemonic = new Mnemonic();
    }
    const password = '';
    const masterPath = testnet ? "m/44'/1'/0'" : "m/44'/0'/0'"; // test without wallet /0
    const path = testnet ? "m/44'/1'/0'/0/0" : "m/44'/0'/0'/0/0";
    // Private key generations
    const xPrivateKey = mnemonic.toHDPrivateKey(password);
    const { privateKey } = xPrivateKey.derive(path);
    const { masterPivateKey = privateKey } = xPrivateKey.derive(masterPath);
    const masterPrivKeyBuf = masterPivateKey.bn.toBuffer({ size: 32 });
    // Wif generations
    const masterWif = toWif(masterPrivKeyBuf, testnet);
    // Public key generation & address definition
    const publicKey = privateKey.publicKey.toBuffer().toString('base64');
    const address = getChash160(['sig', { pubkey: publicKey }]);
   
    yield put(createInitialWalletSuccess({
      address,
      masterWif,
      xPrivateKey,
      seedWords: mnemonic.phrase,
    }));
  } catch (error) {
    yield put(createInitialWalletFail());
    yield put(setToastMessage({
      type: 'ERROR',
      message: 'Unable to generate new wallet.',
    }));
    console.log(error);
  }
}

export function* fetchBalances(action) {
  try {
    const walletData = yield select(selectWallet());
    const balances = yield call(oClient.api.getBalances, walletData.addresses);
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
    yield put(loadWalletHistory());
    const walletData = yield select(selectWallet());
    const params = {
      witnesses: walletData.witnesses,
      addresses: walletData.addresses
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

export function* subscribeToHub(action) {
  try {
    const wsPromise = new Promise((resolve, reject) => oClient.subscribe((err, [messageType, message]) => {
      if (err) {
        reject(err);
      } else {
        resolve({ messageType, message });
      }
    }));
    const { messageType, message } = yield wsPromise;
    if (messageType === 'justsaying' && message.subject && message.body) {
      if (message.subject === 'exchange_rates' && message.body && message.body.exchangeRates) {
        put(setExchangeRates(message.body));
      } else {
        //console.log('Unhandled WS message', message);
      }
    } else {
      //console.log('Unhandled WS message', message);
    }
  } catch (error) {
    yield put(setToastMessage({
      type: 'ERROR',
      message: 'Connection to hub failed',
    }));
    console.log(error);
  }
}

export function* sendPayment(action) {
  try {
    const walletData = yield select(selectWallet());
    const params = {
      ...action.payload
    };
    
    yield call(oClient.post.payment, params, walletData.masterWif);
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

export function* heartbeatToHub(action) {
  call(setInterval, () => oClient.api.heartbeat(), 10 * 1000);
}

export default function* walletSagas() {
  yield takeLatest(actionTypes.WALLET_INIT_START, initWallet);
  yield takeLatest(actionTypes.INITIAL_WALLET_CREATE_START, createInitialWallet);
  yield takeLatest(actionTypes.WALLET_BALANCES_FETCH_START, fetchBalances);
  yield takeEvery(actionTypes.PAYMENT_SEND_START, sendPayment);
}
