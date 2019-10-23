import { REHYDRATE } from 'redux-persist';
import { actionTypes } from '../constants';


const initialState = {
  seedWords: null,
  xPrivateKey: null,
  address: null, // index of current address
  addresses: [],
  masterWif: null,
  witnesses: [],
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case REHYDRATE:
      return {
        ...state,
        ...action.payload.wallet,
      };

    case actionTypes.INITIAL_WALLET_CREATE_SUCCESS:
      return {
        ...state,
        seedWords: action.payload.seedWords,
        address: 0,
        addresses: [action.payload.address],
        xPrivateKey: action.payload.xPrivateKey,
        masterWif: action.payload.masterWif,
      };

    case actionTypes.WITNESSES_GET_SUCCESS:
      return {
        ...state,
        witnesses: action.payload,
      }

    case actionTypes.WITNESSES_RESET:
      return {
        ...state,
        witnesses: initialState.witnesses,
      }

    default:
      return {
        ...state,
      };
  }
}

export default reducer;