import { takeLatest, call, put, select, delay } from '@redux-saga/core/effects';
import NavigationService from './../navigation/service';
import { createWallet, oClient } from './../lib/Wallet';
import { actionTypes, common } from './../constants';
import {
  createInitialWalletSuccess,
  createInitialWalletFail,
  getWitnessesSuccess,
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
      yield call(createInitialWallet, action);
    }

    // Handle web socket traffic
    yield call(subscribeToHub, action);
    console.log('Subscribed to hub');
    yield call(heartbeatToHub, action);
    console.log('Started heartbeating to hub');
    // Fetch wallet data from hub
    yield call(fetchBalances, action);
    console.log('Loaded balances');
    yield call(fetchWitnesses, action);
    console.log('Loaded witnesses');
    yield call(fetchWalletHistory, action);
    console.log('Loaded wallet history');
  } catch (error) {
    yield put(createInitialWalletFail({
      error,
      type: 'ERROR',
      message: 'Unable to init wallet.',
    }));
  }
}

export function* createInitialWallet(action) {
  try {
    const wallet = yield call(createWallet);
    yield put(createInitialWalletSuccess({
      seedWords: wallet.seedWords,
      privKey: wallet.privateKey,
      pubKey: wallet.publicKey,
      address: wallet.address,
      path: wallet.path,
      wif: wallet.wif,
    }));
    yield call(NavigationService.navigate, 'SeedWords');
  } catch (error) {
    yield put(createInitialWalletFail({
      error,
      type: 'ERROR',
      message: 'Unable to generate new wallet.',
    }));
  }
}

export function* fetchBalances(action) {
  try {
    const walletData = yield select(selectWallet());
    const balances = yield call(oClient.api.getBalances, walletData.addresses);
    put(loadWalletBalancesSuccess(balances));
  } catch (error) {
    yield put(loadWalletBalancesFail({
      error,
      type: 'ERROR',
      message: 'Unable to fetch balances.',
    }));
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
  } catch(error) {
    console.error(error);
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
      //console.log(history, err);
      if (err) {
        reject(err);
      } else {
        resolve(history);
      }
    }));
    const history = yield historyPromise;
    yield put(loadWalletHistorySuccess(history));
  } catch(error) {
    yield put(loadWalletHistoryFail({
      error,
      type: 'ERROR',
      message: 'Unable to fetch transactions.',
    }));
    console.error(error);
  }
}

export function* subscribeToHub(action) {
  const wsPromise = new Promise((resolve, reject) => oClient.subscribe((err, [messageType, message]) => {
    if (err) {
      reject(err);
    } else {
      resolve({ messageType, message });
    }
  }));
  const { messageType, message } = yield wsPromise;

  if (messageType === 'justsaying' && message.subject && message.body) {
    if (message.subject === 'exchange_rates' && message.body) {
      put(setExchangeRates(message.body));
    } else {
      console.log('Unhandled WS message', message);
    }
  } else {
    console.log('Unhandled WS message', message);
  }
}

export function* heartbeatToHub(action) {
  call(setInterval, () => oClient.api.heartbeat(), 10 * 1000);
}

export default function* walletSagas() {
  yield takeLatest(actionTypes.WALLET_INIT_START, initWallet);
  yield takeLatest(actionTypes.INITIAL_WALLET_CREATE_START, createInitialWallet);
  yield takeLatest(actionTypes.WALLET_BALANCES_FETCH_START, fetchBalances);
}
