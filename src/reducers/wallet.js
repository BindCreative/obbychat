import { REHYDRATE } from 'redux-persist';
import { actionTypes } from '../constants';


const initialState = {
  seedWords: null,
  privKey: null,
  pubKey: null,
  path: null,
  wif: null,
  address: null, // index of current address
  addresses: [],
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
        ...action.payload,
        addresses: [action.payload.address],
        address: 0,
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