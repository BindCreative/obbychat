import _ from 'lodash';
import { REHYDRATE } from 'redux-persist';
import { actionTypes } from '../constants';

const initialState = {
  passwordProtected: false,
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
      return { ...state, passwordProtected: true };
    case actionTypes.SET_PASSWORD_NOT_PROTECTED:
      return { ...state, passwordProtected: true };
    case actionTypes.SET_SEED_WORDS:
      return { ...state, seedWords: action.payload };
    default:
      return state;
  }
};

export default reducer;

