import { all } from 'redux-saga/effects';
import walletSaga from './wallet';


export default function* rootSaga() {
  yield all([
    walletSaga(),
  ]);
}
