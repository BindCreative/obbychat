import _ from 'lodash';
import { REHYDRATE } from 'redux-persist';
import { actionTypes } from '../constants';

const initialState = {
  password: null,
  seedWords: null,
  witnesses: [],
  address: null,
  addressPath: null,
  walletWif: null,
  addressWif: null,
  xPrivKey: null,
  publicKey: null,
  privateKey: null,
  walletPirvateKey: null,
  walletPath: null,
  init: false
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case REHYDRATE:
      return _.get(action, 'payload.wallet', state);

    case actionTypes.INITIAL_WALLET_CREATE_SUCCESS:
      return {
        ...state,
        ...action.payload,
      };

    case actionTypes.WALLET_INIT_SUCCESS:
      return {
        ...state,
        init: true
      };

    case actionTypes.WITNESSES_GET_SUCCESS:
      return {
        ...state,
        witnesses: action.payload,
      };

    case actionTypes.WITNESSES_RESET:
      return {
        ...state,
        witnesses: initialState.witnesses,
      };

    default:
      return state;
  }
}

export default reducer;
