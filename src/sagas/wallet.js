import { takeLatest, take, call, put, select } from '@redux-saga/core/effects';
import Mnemonic from 'bitcore-mnemonic';
import { toWif, getChash160 } from 'obyte/lib/utils';
import { Alert } from 'react-native';
import { REHYDRATE } from 'redux-persist';
import NavigationService from './../navigation/service';
import { oClient, testnet } from './../lib/oCustom';
import { actionTypes } from './../constants';
import { subscribeToHub } from './device';
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
  loadWalletHistorySuccess,
  loadWalletHistoryFail,
} from '../actions/walletHistory';
import {
  loadWalletBalancesSuccess,
  loadWalletBalancesFail,
} from './../actions/balances';
import {
  selectWalletAddress,
  selectWitnesses,
  selectAddressWif,
} from './../selectors/wallet';
import { initDeviceInfo } from "../actions/device";

export function* initWallet({ payload }) {
  try {
    yield put(createInitialWalletStart(payload));
    yield put(initDeviceInfo());
    // Handle websocket traffic
    yield call(subscribeToHub);
    // Fetch wallet data from hub
    yield call(fetchBalances);
    yield call(fetchWitnesses);
    yield call(fetchWalletHistory);
    yield put(initWalletSuccess());
  } catch (error) {
    console.log(error);
    yield put(initWalletFail());
    yield put(
      setToastMessage({
        type: 'ERROR',
        message: 'Unable to init wallet.',
      }),
    );
  }
}

export function* createInitialWallet({ payload }) {
  try {
    if (!payload.address) {
      const password = '';
      let mnemonic = new Mnemonic();
      while (!Mnemonic.isValid(mnemonic.toString())) {
        mnemonic = new Mnemonic();
      }
      const xPrivKey = mnemonic.toHDPrivateKey();

      // Wallet wif
      const walletPath = testnet ? "m/44'/1'/0'/0'" : "m/44'/0'/0'/0";
      const { privateKey: walletPirvateKey } = yield xPrivKey.derive(
        walletPath,
      );
      const walletPrivKeyBuf = yield walletPirvateKey.bn.toBuffer({
        size: 32,
      });
      const walletWif = yield call(toWif, walletPrivKeyBuf, testnet);

      // Address and address wif
      const addressPath = testnet ? "m/44'/1'/0'/0/0" : "m/44'/0'/0'/0/0";
      const { privateKey } = yield xPrivKey.derive(addressPath);
      const publicKeyBuffer = yield privateKey.publicKey.toBuffer();
      const publicKey = yield publicKeyBuffer.toString('base64');
      const addressPrivKeyBuf = yield privateKey.bn.toBuffer({ size: 32 });
      const addressWif = yield call(toWif, addressPrivKeyBuf, testnet);
      const address = yield call(getChash160, ['sig', { pubkey: publicKey }]);

      yield put(
        createInitialWalletSuccess({
          password,
          address,
          addressPath,
          walletWif,
          addressWif,
          xPrivKey,
          publicKey,
          privateKey,
          walletPirvateKey,
          walletPath,
          seedWords: mnemonic.phrase,
        }),
      );

      yield put(
        setToastMessage({
          type: 'SUCCESS',
          message: 'Your wallet is ready to use!',
        }),
      );
    }
  } catch (error) {
    console.log('createInitialWallet ERROR: ', error);
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
  const walletAddress = yield select(selectWalletAddress());
  if (walletAddress) {
    try {
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
    }
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
    // console.log({ error });
  }
}

export function* fetchWalletHistory() {
  const walletAddress = yield select(selectWalletAddress());
  if (walletAddress) {
    try {
      const witnesses = yield select(selectWitnesses());
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
    }
  }
}

export function* sendPayment(action) {
  try {
    const addressWif = yield select(selectAddressWif());
    const params = {
      ...action.payload,
    };

    yield call(oClient.post.payment, params, addressWif);
    yield put(sendPaymentSuccess());
    yield put(
      setToastMessage({
        type: 'SUCCESS',
        message: 'Transaction broadcasted',
      }),
    );
    yield call(fetchBalances, action);
    yield call(fetchWalletHistory, action);
    yield call(NavigationService.navigate, 'Wallet');
  } catch (error) {
    yield put(sendPaymentFail());
    yield put(
      setToastMessage({
        type: 'ERROR',
        message: 'Unable to send payment',
      }),
    );
  }
}

export function* updateWalletData() {
  const address = yield select(selectWalletAddress());
  yield call(fetchBalances, { address });
  yield call(fetchWalletHistory, { address });
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
  yield takeLatest(actionTypes.UPDATE_WALLET_DATA, updateWalletData)
}
