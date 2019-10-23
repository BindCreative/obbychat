import { all } from '@redux-saga/core/effects';
import appSaga from './app';
import walletSaga from './wallet';


export default function* rootSaga() {
  yield all([
    appSaga(),
    walletSaga(),
  ]);
}
