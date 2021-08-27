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

export const openLink = payload => ({
  type: actionTypes.OPEN_LINK,
  payload
});

export const setDefaultUnitSize = payload => ({
  type: actionTypes.SET_UNIT_SIZE,
  payload
});

export const setFcmToken = payload => ({
  type: actionTypes.SET_FCM_TOKEN,
  payload
});

export const initNotificationsRequest = () => ({
  type: actionTypes.INIT_NOTIFICATIONS
});

export const setNotificationsEnabling = payload => ({
  type: actionTypes.SET_NOTIFICATIONS_ENABLING,
  payload
});

export const enableNotificationsRequest = () => ({
  type: actionTypes.ENABLE_NOTIFICATIONS
});

export const disableNotificationsRequest = () => ({
  type: actionTypes.DISABLE_NOTIFICATIONS
});

export const setHistoryState = payload => ({
  type: actionTypes.SET_HISTORY_STATE,
  payload
});

export const runNfcReader = () => ({
  type: actionTypes.RUN_NFC_READER
});

export const stopNfcReader = () => ({
  type: actionTypes.STOP_NFC_READER
});

export const runHceSimulator = payload => ({
  type: actionTypes.RUN_HCE_SIMULATOR,
  payload
});

export const stopHceSimulator = () => ({
  type: actionTypes.STOP_HCE_SIMULATOR
});
