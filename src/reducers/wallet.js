import { REHYDRATE } from 'redux-persist';
import { actionTypes } from '../constants';


const initialState = {
  seedWords: null,
  privKey: null,
  pubKey: null,
  path: null,
  wif: null,
  address: 0, // index of current address
  addresses: [],
  witnesses: [],
};

function walletReducer(state = initialState, action) {
  switch (action.type) {
    case REHYDRATE:
      return {
        ...state,
        ...action.payload.wallet,
        addresses: ['UH2PYPG3LYLA2TAX4U2YEAMB665R3LFQ'], // DEV PURPOSES ONLY
        address: 0,
      };

    case actionTypes.INITIAL_WALLET_CREATE_SUCCESS:
      return {
        ...state,
        ...action.payload,
        addresses: [...state.addresses, action.payload.address],
        address: state.addresses.length ? state.addresses.length - 1 : 0,
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
      return state;
  }
}

export default walletReducer;