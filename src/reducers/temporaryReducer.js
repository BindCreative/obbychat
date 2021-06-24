import { actionTypes } from '../constants';

const initialState = {
  witnesses: [],
  address: null,
  addressPath: null,
  walletWif: null,
  addressWif: null,
  deviceWif: null,
  xPrivKey: null,
  publicKey: null,
  privateKey: null,
  walletPirvateKey: null,
  walletPath: null,
  hashedWif: null,
  walletInit: false,
  accountInit: false,
  connectedToHub: false,
  fcmToken: null
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.INITIAL_WALLET_CREATE_SUCCESS:
      return {
        ...state,
        ...action.payload,
      };

    case actionTypes.WALLET_INIT_START:
      return {
        ...state,
        walletInit: false
      };

    case actionTypes.WALLET_INIT_SUCCESS:
      return {
        ...state,
        walletInit: true
      };

    case actionTypes.ACCOUNT_INIT_SUCCESS:
      return {
        ...state,
        accountInit: true
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

    case actionTypes.SET_CONNECTION_STATUS:
      return {
        ...state,
        connectedToHub: action.payload,
      };

    case actionTypes.SET_FCM_TOKEN:
      return {
        ...state,
        fcmToken: action.payload
      };

    case actionTypes.RESTORE_ACCOUNT:
    case actionTypes.RESET_ACCOUNT:
      return initialState;

    default:
      return state;
  }
}

export default reducer;
