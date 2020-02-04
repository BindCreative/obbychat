import _ from 'lodash';
import { REHYDRATE } from 'redux-persist';
import { actionTypes } from '../constants';

const initialState = {
  history: null,
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case REHYDRATE:
      return _.get(action, 'payload.walletHistory', state);

    case actionTypes.WALLET_HISTORY_GET_SUCCESS:
      return {
        ...state,
        history: action.payload,
      };

    case actionTypes.WALLET_HISTORY_GET_FAILED:
      return {
        ...state,
        history: initialState.history,
      };

    case actionTypes.INITIAL_WALLET_CREATE_SUCCESS:
      return initialState;

    default:
      return state;
  }
}

export default reducer;
