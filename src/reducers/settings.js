import { REHYDRATE } from 'redux-persist';
import { actionTypes } from '../constants';


const initialState = {
  unitSize: 'MB', // B | kB | MB | GB
};

function settingsReducer(state = initialState, action) {
  switch (action.type) {
    case REHYDRATE:
        return {
          ...state,
          ...action.payload.settings,
        };

    case actionTypes.SETTINGS_SET:
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}

export default settingsReducer;