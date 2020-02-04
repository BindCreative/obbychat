import _ from 'lodash';
import { REHYDRATE } from 'redux-persist';
import { actionTypes } from '../constants';

const initialState = {
  loading: false,
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case REHYDRATE:
      return _.get(action, 'payload.balances', state);

    case actionTypes.WALLET_BALANCES_FETCH_START:
      return {
        ...state,
        loading: true,
      };

    case actionTypes.WALLET_BALANCES_FETCH_SUCCESS:
      return {
        ...state,
        ...action.payload,
        loading: false,
      };

    case actionTypes.WALLET_BALANCES_FETCH_FAILED:
      return {
        ...state,
        loading: false,
      };

    case actionTypes.INITIAL_WALLET_CREATE_SUCCESS:
      return initialState;

    default:
      return state;
  }
}

export default reducer;
