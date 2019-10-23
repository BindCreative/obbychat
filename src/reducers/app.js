import { REHYDRATE } from 'redux-persist';
import uuidv4 from 'uuid/v4'
import { actionTypes } from '../constants';


const initialState = {};

function reducer(state = initialState, action) {
  switch (action.type) {
    case REHYDRATE:
        return {
          ...state,
          ...action.payload.app,
        };

    default:
      return state;
  }
}

export default reducer;