import { REHYDRATE } from 'redux-persist';
import { actionTypes } from '../constants';


const initialState = {
  history: null,
};

function transactionsReducer(state = initialState, action) {
  switch (action.type) {
    case REHYDRATE:
        return {
          ...state,
          ...action.payload.transactions,
        };

    case actionTypes.TRANSACTIONS_HISTORY_GET_SUCCESS:
      return {
        ...state,
        history: action.payload,
      };

    default:
      return state;
  }
}

export default transactionsReducer;