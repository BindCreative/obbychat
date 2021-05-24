import { actionTypes } from './../constants';

export const setSeedWords = seedWords => ({
  type: actionTypes.SET_SEED_WORDS,
  payload: seedWords
});

export const setPasswordProtected = () => ({
  type: actionTypes.SET_PASSWORD_PROTECTED
});

export const setPasswordNotProtected = () => ({
  type: actionTypes.SET_PASSWORD_NOT_PROTECTED
});
