import _ from 'lodash';
import { REHYDRATE } from 'redux-persist';
import { actionTypes } from '../constants';

const initialState = {
  unitSize: 'MB', // B | kB | MB | GB
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case REHYDRATE:
      return _.get(action, 'payload.settings', state);

    case actionTypes.SETTINGS_SET:
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}

export default reducer;
