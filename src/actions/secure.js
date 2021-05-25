import { actionTypes } from './../constants';

export const setSeedWords = seedWords => ({
  type: actionTypes.SET_SEED_WORDS,
  payload: seedWords
});

export const setPasswordProtected = payload => ({
  type: actionTypes.SET_PASSWORD_PROTECTED,
  payload
});
