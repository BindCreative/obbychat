import { actionTypes } from './../constants';

export const setSettings = payload => ({
  type: actionTypes.SETTINGS_SET,
  payload,
});

export const resetSettings = () => ({
  type: actionTypes.SETTINGS_RESET,
});
