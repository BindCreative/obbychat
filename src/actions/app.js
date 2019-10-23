import { actionTypes } from './../constants';


export const setToastMessage = (payload) => ({
  type: actionTypes.APP_TOAST_SET,
  payload,
});