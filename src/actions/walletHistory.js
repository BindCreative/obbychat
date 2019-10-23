import { actionTypes } from './../constants';


export const loadWalletHistory = () => ({
  type: actionTypes.WALLET_HISTORY_GET_START,
})

export const loadWalletHistorySuccess = (payload) => ({
  type: actionTypes.WALLET_HISTORY_GET_SUCCESS,
  payload,
})

export const loadWalletHistoryFail = (payload) => ({
  type: actionTypes.WALLET_HISTORY_GET_FAILED,
  payload,
})