import { createSelector } from 'reselect';


export const getExchangeRatesState = (state) => state.main.exchangeRates;

export const selectExchangeRates = () => createSelector(
  getExchangeRatesState,
  state => state
);