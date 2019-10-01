import { takeLatest, call } from '@redux-saga/core/effects';
import { actionTypes } from './../constants';
import { createWallet } from './../lib/Wallet';


export function* createInitialWallet(action) {
  const walletData = yield call(createWallet);
  console.log(walletData);
}

export default function* walletSagas() {
  yield takeLatest(actionTypes.INITIAL_WALLET_CREATE_START, createInitialWallet);
}
