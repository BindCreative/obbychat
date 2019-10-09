import { REHYDRATE } from 'redux-persist';
import { actionTypes } from '../constants';


const initialState = {
  seedWords: null,
  privKey: null,
  pubKey: null,
  currentAddress: null,
  currentPath: null,
  wif: null,
};

function walletReducer(state = initialState, action) {
  switch (action.type) {
    case REHYDRATE:
      return {
        ...state,
        ...action.payload.wallet,
      };

    case actionTypes.INITIAL_WALLET_CREATE_SUCCESS:
      return {
        ...state,
        ...action.payload,
      };

    case actionTypes.INITIAL_WALLET_CREATE_FAILED:
      return initialState;
      
    default:
      return state;
  }
}

export default walletReducer;