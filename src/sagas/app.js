import { takeLatest, call, put } from '@redux-saga/core/effects';
import Toast from 'react-native-root-toast';
import { actionTypes } from './../constants';

export function* showToastMessage(action) {
  yield call(Toast.show, action.payload.message, {
    duration: Toast.durations.LONG,
    position: Toast.positions.BOTTOM,
    shadow: true,
    animation: true,
    hideOnPress: true,
    delay: 0,
  });
}

export default function* walletSagas() {
  yield takeLatest(actionTypes.APP_TOAST_SET, showToastMessage);
}
