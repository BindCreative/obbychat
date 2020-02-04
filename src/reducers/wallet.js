import _ from 'lodash';
import { REHYDRATE } from 'redux-persist';
import { actionTypes } from '../constants';

const initialState = {
  password: '',
  seedWords:
    'wise pulp cruise wrap sunset run clap car budget key meadow diagram',
  witnesses: [],
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case REHYDRATE:
      if (action.payload?.wallet) {
        return action.payload.wallet;
      } else {
        return state;
      }

    case actionTypes.INITIAL_WALLET_CREATE_SUCCESS:
      return {
        ...state,
        password: action.payload.password,
        seedWords: action.payload.seedWords,
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
