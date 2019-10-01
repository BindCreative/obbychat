import { all } from '@redux-saga/core/effects';
import walletSaga from './wallet';


export default function* rootSaga() {
  yield all([
    walletSaga(),
  ]);
}
