import _ from 'lodash';
import { REHYDRATE } from 'redux-persist';
import { actionTypes } from './../constants';

const initialState = {
  correspondents: {},
  unreadMessages: 0,
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case REHYDRATE:
      return _.get(action, 'payload.messages', state);

    case actionTypes.UNREAD_MESSAGE_COUNT_SET:
      return {
        ...state,
        ...action.payload,
      };

    case actionTypes.MESSAGE_RECEIVE_SUCCESS:
    case actionTypes.MESSAGE_ADD_SUCCESS:
      return {
        ...state,
        correspondents: {
          ...state.correspondents,
          [action.payload.address]: {
            ...state.correspondents[action.payload.address],
            messages: [
              ...state.correspondents[action.payload.address].messages,
              {
                type: action.payload.messageType,
                message: action.payload.message,
                hash: action.payload.messageHash,
                handleAs: action.payload.handleAs,
                timestamp: action.payload.timestamp,
              },
            ],
          },
        },
      };

    case actionTypes.MESSAGE_REMOVE:
      return {
        ...state,
        correspondents: {
          ...state.correspondents,
          [action.payload.address]: {
            ...state.correspondents[action.payload.address],
            messages: {
              ...state.correspondents[action.payload.address].messages.filter(
                message => message.hash !== action.payload.messageHash,
              ),
            },
          },
        },
      };

    case actionTypes.CORRESPONDENT_DEVICE_ADD:
      return {
        ...state,
        correspondents: {
          ...state.correspondents,
          [action.payload.address]: {
            name: action.payload.name,
            hub: action.payload.hub,
            pubKey: action.payload.pubKey,
            pairingSecret: action.payload.pairingSecret,
            reversePairingSecret: action.payload.reversePairingSecret,
            visible: true,
            messages:
              state.correspondents[action.payload.address]?.messages ?? [],
          },
        },
      };

    case actionTypes.CORRESPONDENT_DEVICE_REMOVE:
      return {
        ...state,
        correspondents: {
          ...state.correspondents,
          [action.payload.address]: {
            ...state.correspondents[action.payload.address],
            visible: false,
          },
        },
      };

    default:
      return state;
  }
}

export default reducer;
