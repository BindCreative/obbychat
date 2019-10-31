import { REHYDRATE } from 'redux-persist';
import Crypto from 'crypto';
import { actionTypes } from '../constants';


const initialState = {
  deviceTempKeys: {
    prevPrivKey: Crypto.randomBytes(32),
    privKey: Crypto.randomBytes(32),
    rotationTimestamp: Date.now(),
  }
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case REHYDRATE:
      return {
        ...state,
        ...action.payload.app,
      };

    case actionTypes.DEVICE_TEMP_KEY_ROTATE:
      return {
        ...state,
        deviceTempKeys: {
          privKey: Crypto.randomBytes(32),
          privKey: action.payload.privKey,
          prevPrivKey: state.deviceTempKeys.privKey,
          rotationTimestamp: Date.now(),
        }
      };

    default:
      return state;
  }
}

export default reducer;