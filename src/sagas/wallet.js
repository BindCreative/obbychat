import { takeLatest, call, put, select, delay } from '@redux-saga/core/effects';
import NavigationService from './../navigation/service';
import { createWallet, oClient } from './../lib/Wallet';
import { actionTypes, common } from './../constants';
import {
  createInitialWalletSuccess,
  createInitialWalletFail,
  loadWalletBalancesSuccess,
  loadWalletBalancesFail,
  setExchangeRates,
} from './../actions/wallet';
import { selectWallet } from './../selectors/wallet';
import { rejects } from 'assert';


export function* initWallet(action) {
  try {
    const walletData = yield select(selectWallet());

    if (walletData.addresses.length < 1) {
      // New wallet
      yield call(createInitialWallet, action);
    } 

    yield call(loadBalances, action);

    // Handle web socket messages

    const wsPromise = new Promise((resolve, reject) => oClient.subscribe((err, [messageType, message]) => {
      console.log(999 ,messageType);
      if (err) {
        reject(err);
      } else {
        resolve({ messageType, message });
      }
    }));
    const { messageType, message } = yield wsPromise;
    console.log(111, messageType, message);
    if (messageType === 'justsaying' && message.subject && message.body) {
      if (message.subject === 'exchange_rates' && message.body) {
        yield put(setExchangeRates(message.body));
      } else {
        console.log('Unhandled WS message', message);
      }
    } else {
      console.log('Unhandled WS message', message);
    }

    //yield call(setInterval, () => oClient.api.heartbeat(), 10 * 1000);
  } catch(error) {
    console.error(error);
    yield put(createInitialWalletFail({
      error,
      type: 'ERROR',
      message: 'Something went wrong, unable to init wallet.',
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
  } catch(error) {
    yield put(createInitialWalletFail({
      error,
      type: 'ERROR',
      message: 'Something went wrong, unable to generate new wallet.',
    }));
  }
}

export function* loadBalances(action) {
  try {
    const walletData = yield select(selectWallet());
    const balances = yield call(oClient.api.getBalances, walletData.addresses);
    yield put(loadWalletBalancesSuccess(balances));
  } catch(error) {
    yield put(loadWalletBalancesFail({
      error,
      type: 'ERROR',
      message: 'Something went wrong, unable to generate new wallet.',
    }));
  }
}

export default function* walletSagas() {
  yield takeLatest(actionTypes.WALLET_INIT_START, initWallet);
  yield takeLatest(actionTypes.INITIAL_WALLET_CREATE_START, createInitialWallet);
  yield takeLatest(actionTypes.WALLET_BALANCES_FETCH_START, loadBalances);
}
