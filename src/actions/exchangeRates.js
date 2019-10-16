import { actionTypes } from './../constants';


export const setExchangeRates = (payload) => ({
  type: actionTypes.EXCHANGE_RATES_SET,
  payload,
})

export const resetExchangeRates = () => ({
  type: actionTypes.EXCHANGE_RATES_RESET,
})