import { REHYDRATE } from 'redux-persist';
import { actionTypes } from '../constants';


const initialState = {};

function balancesReducer(state = initialState, action) {
  switch (action.type) {
    case REHYDRATE:
        return {
          ...state,
          ...action.payload.balances,
        };

    case actionTypes.WALLET_BALANCES_FETCH_SUCCESS:
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}

export default balancesReducer;