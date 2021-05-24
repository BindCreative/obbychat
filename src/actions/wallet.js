import { actionTypes } from './../constants';

export const initWallet = (payload) => ({
  type: actionTypes.WALLET_INIT_START,
  payload
});

export const initWalletSuccess = (payload) => ({
  type: actionTypes.WALLET_INIT_SUCCESS,
  payload,
});

export const initAccountSuccess = (payload) => ({
  type: actionTypes.ACCOUNT_INIT_SUCCESS,
  payload,
});

export const initWalletFail = payload => ({
  type: actionTypes.WALLET_INIT_FAILED,
  payload,
});

export const createInitialWalletStart = (payload) => ({
  type: actionTypes.INITIAL_WALLET_CREATE_START,
  payload
});

export const createInitialWalletSuccess = payload => ({
  type: actionTypes.INITIAL_WALLET_CREATE_SUCCESS,
  payload,
});

export const createInitialWalletFail = payload => ({
  type: actionTypes.INITIAL_WALLET_CREATE_FAILED,
  payload,
});

export const getWitnessesSuccess = payload => ({
  type: actionTypes.WITNESSES_GET_SUCCESS,
  payload,
});

export const resetWitnesses = () => ({
  type: actionTypes.WITNESSES_RESET,
});

export const sendPaymentStart = payload => ({
  type: actionTypes.PAYMENT_SEND_START,
  payload,
});

export const sendPaymentSuccess = () => ({
  type: actionTypes.PAYMENT_SEND_SUCCESS,
});

export const sendPaymentFail = () => ({
  type: actionTypes.PAYMENT_SEND_FAILED,
});
