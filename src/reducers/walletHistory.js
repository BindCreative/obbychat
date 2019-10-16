import { REHYDRATE } from 'redux-persist';
import { actionTypes } from '../constants';


const initialState = {
  history: null,
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case REHYDRATE:
        return {
          ...state,
          ...action.payload.walletHistory,
        };

    case actionTypes.WALLET_HISTORY_GET_SUCCESS:
      return {
        ...state,
        history: action.payload,
      };

    default:
      return state;
  }
}

export default reducer;