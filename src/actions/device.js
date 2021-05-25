import { actionTypes } from './../constants';

export const rotateDeviceTempKey = () => ({
  type: actionTypes.DEVICE_TEMP_KEY_ROTATE,
});

export const reSubscribeToHub = () => ({
  type: actionTypes.RESUBSCRIBE_TO_HUB
});

export const stopSubscribeToHub = () => ({
  type: actionTypes.STOP_SUBSCRIBE_TO_HUB
});

export const setConnectionStatus = payload => ({
  type: actionTypes.SET_CONNECTION_STATUS,
  payload
});

export const initDeviceInfo = () => ({
  type: actionTypes.INIT_DEVICE_INFO
});

export const initDeviceSuccess = payload => ({
  type: actionTypes.INIT_DEVICE_SUCCESS,
  payload
});

export const generateSeedWords = payload => ({
  type: actionTypes.GENERATE_SEED_WORDS,
  payload
});

export const restoreAccount = payload => ({
  type: actionTypes.RESTORE_ACCOUNT,
  payload
});

export const resetAccount = () => ({
  type: actionTypes.RESET_ACCOUNT
});
