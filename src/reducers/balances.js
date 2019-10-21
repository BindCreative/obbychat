import { REHYDRATE } from 'redux-persist';
import { actionTypes } from '../constants';


const initialState = {};

function reducer(state = initialState, action) {
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
      
    case actionTypes.INITIAL_WALLET_CREATE_SUCCESS:
      return initialState;

    default:
      return state;
  }
}

export default reducer;