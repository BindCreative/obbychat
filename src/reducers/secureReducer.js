import _ from 'lodash';
import { REHYDRATE } from 'redux-persist';
import { actionTypes } from '../constants';

const initialState = {
  passwordProtected: true,
  seedWords: ''
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case REHYDRATE: {
      if (action.key === 'secure') {
        return {
          ...state,
          ...action.payload
        };
      } else {
        return state;
      }
    }
    case actionTypes.SET_PASSWORD_PROTECTED:
      return { ...state, passwordProtected: action.payload };
    case actionTypes.SET_SEED_WORDS:
      return { ...state, seedWords: action.payload };
    case actionTypes.RESTORE_ACCOUNT:
      return {
        ...initialState,
        seedWords: action.payload
      };
    case actionTypes.RESET_ACCOUNT:
      return initialState;
    default:
      return state;
  }
};

export default reducer;

