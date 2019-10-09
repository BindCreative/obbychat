import { actionTypes } from './../constants';


export const createInitialWallet = () => ({
  type: actionTypes.INITIAL_WALLET_CREATE_START,
})

export const createInitialWalletSuccess = (payload) => ({
  type: actionTypes.INITIAL_WALLET_CREATE_SUCCESS,
  payload,
})

export const createInitialWalletFail = (payload) => ({
  type: actionTypes.INITIAL_WALLET_CREATE_FAILED,
  payload,
})