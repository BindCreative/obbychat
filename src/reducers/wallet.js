import { REHYDRATE } from 'redux-persist';


const initialState = {};

function walletReducer(state = initialState, action) {

  switch (action.type) {
    case REHYDRATE:
      return {
        ...state,
        ...action.payload.wallet,
      };

    default:
      return state;
  }
}

export default walletReducer;