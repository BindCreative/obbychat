import { createSelector } from 'reselect';

export const getExchangeRatesState = state => state.main.exchangeRates;

export const selectExchangeRates = () =>
  createSelector(getExchangeRatesState, state => ({
    ...state,
    MBYTE_USD: state.GBYTE_USD ? state.GBYTE_USD / 1000 : null,
    kBYTE_USD: state.GBYTE_USD ? state.GBYTE_USD / 1000000 : null,
    BYTE_USD: state.GBYTE_USD ? state.GBYTE_USD / 1000000000 : null,
    MBYTE_BTC: state.GBYTE_BTC ? state.GBYTE_BTC / 1000 : null,
    kBYTE_BTC: state.GBYTE_BTC ? state.GBYTE_BTC / 1000000 : null,
    BYTE_BTC: state.GBYTE_BTC ? state.GBYTE_BTC / 1000000000 : null,
  }));
