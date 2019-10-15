import { actionTypes } from './../constants';


export const initWallet = () => ({
  type: actionTypes.WALLET_INIT_START,
})

export const initWalletSuccess = (payload) => ({
  type: actionTypes.WALLET_INIT_SUCCESS,
  payload,
})

export const initWalletFail = (payload) => ({
  type: actionTypes.WALLET_INIT_FAILED,
  payload,
})

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

export const loadWalletBalances = () => ({
  type: actionTypes.WALLET_BALANCES_FETCH_START,
})

export const loadWalletBalancesSuccess = (payload) => ({
  type: actionTypes.WALLET_BALANCES_FETCH_SUCCESS,
  payload,
})

export const loadWalletBalancesFail = (payload) => ({
  type: actionTypes.WALLET_BALANCES_FETCH_FAILED,
  payload,
})

export const loadTransactionsHistory = () => ({
  type: actionTypes.TRANSACTIONS_HISTORY_GET_START,
})

export const loadTransactionsHistorySuccess = (payload) => ({
  type: actionTypes.TRANSACTIONS_HISTORY_GET_SUCCESS,
  payload,
})

export const loadTransactionsHistoryFail = (payload) => ({
  type: actionTypes.TRANSACTIONS_HISTORY_GET_FAILED,
  payload,
})

export const setExchangeRates = (payload) => ({
  type: actionTypes.EXCHANGE_RATES_SET,
  payload,
})

export const resetExchangeRates = () => ({
  type: actionTypes.EXCHANGE_RATES_RESET,
})

export const setWitnessesSuccess = (payload) => ({
  type: actionTypes.WITNESSES_GET_SUCCESS,
  payload,
})

export const resetWitnesses = () => ({
  type: actionTypes.WITNESSES_RESET,
})