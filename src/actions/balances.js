import { actionTypes } from './../constants';

export const loadWalletBalances = () => ({
  type: actionTypes.WALLET_BALANCES_FETCH_START,
});

export const loadWalletBalancesSuccess = payload => ({
  type: actionTypes.WALLET_BALANCES_FETCH_SUCCESS,
  payload,
});

export const loadWalletBalancesFail = payload => ({
  type: actionTypes.WALLET_BALANCES_FETCH_FAILED,
  payload,
});

export const updateWalletData = () => ({
  type: actionTypes.UPDATE_WALLET_DATA
});
