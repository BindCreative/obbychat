import { REHYDRATE } from 'redux-persist';
import { actionTypes } from '../constants';


const initialState = {
  BTC_USD: null,
  GBB_BTC: null,
  GBB_GBYTE: null,
  GBB_USD: null,
  GBYTE_USD: null,
  MBYTE_USD: null,
  kBYTE_USD: null,
  BYTE_USD: null,
  updated: null,
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case REHYDRATE:
        return {
          ...state,
          ...action.payload.exchangeRates,
        };

    case actionTypes.EXCHANGE_RATES_SET:
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}

export default reducer;