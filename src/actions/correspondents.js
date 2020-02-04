import { actionTypes } from './../constants';

export const setCorrespondentDevice = payload => ({
  type: actionTypes.CORRESPONDENT_DEVICE_ADD,
  payload,
});
