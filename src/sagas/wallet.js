import { takeLatest, call, put, select, delay } from '@redux-saga/core/effects';
import NavigationService from './../navigation/service';
import { createWallet } from './../lib/Wallet';
import { actionTypes } from './../constants';
import { createInitialWalletSuccess, createInitialWalletFail } from './../actions/wallet';
import { selectWallet } from './../selectors/wallet';


export function* createInitialWallet(action) {
  try {
    const walletData = yield select(selectWallet());
    // All wallet values must be populated for correct setup
    let walletSetupCorrectly = true;
    for (let [key, value] of Object.entries(walletData)) {
      if (value === null) {
        walletSetupCorrectly = false;
      }
    }

    // Run fresh wallet setup
    if (!walletSetupCorrectly) {
      const newWallet = yield call(createWallet);
      yield put(createInitialWalletSuccess({
        seedWords: newWallet.seedWords,
        privKey: newWallet.privateKey,
        pubKey: newWallet.publicKey,
        currentAddress: newWallet.address,
        currentPath: newWallet.path,
        wif: newWallet.wif,
      }));
      yield call(NavigationService.navigate, 'SeedWords');
    }
  } catch (e) {
    yield put(createInitialWalletFail({
      type: 'ERROR',
      message: 'Something went wrong, unable to generate new wallet.'
    }));
  }
}

export default function* walletSagas() {
  yield takeLatest(actionTypes.INITIAL_WALLET_CREATE_START, createInitialWallet);
}
