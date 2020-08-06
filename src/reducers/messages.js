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

    case actionTypes.MESSAGE_ADD_TEMP:
      return {
        ...state,
        correspondents: {
          ...state.correspondents,
          [action.payload.address]: {
            ...state.correspondents[action.payload.address],
            messages: [
              ...state.correspondents[action.payload.address].messages,
              {
                _id: action.payload.id,
                address: action.payload.address,
                message: action.payload.message,
                type: action.payload.type,
                timestamp: action.payload.timestamp,
                handleAs: 'SENT',
                pending: true,
              },
            ],
          },
        },
      };

    case actionTypes.MESSAGE_ADD_SUCCESS:
      return {
        ...state,
        correspondents: {
          ...state.correspondents,
          [action.payload.address]: {
            ...state.correspondents[action.payload.address],
            messages: state.correspondents[action.payload.address].messages.map(
              (message, i) => {
                if (message._id === action.payload.id) {
                  return {
                    ...message,
                    type: action.payload.messageType,
                    message: action.payload.message,
                    hash: action.payload.messageHash,
                    handleAs: action.payload.handleAs,
                    timestamp: action.payload.timestamp,
                    pending: false,
                  };
                }
                return message;
              },
            ),
          },
        },
      };

    case actionTypes.MESSAGE_ADD_FAIL:
      return {
        ...state,
        correspondents: {
          ...state.correspondents,
          [action.payload.address]: {
            ...state.correspondents[action.payload.address],
            messages: state.correspondents[action.payload.address].messages.map(
              (message, i) => {
                if (message._id === action.payload.id) {
                  return {
                    ...message,
                    pending: true,
                  };
                }
                return message;
              },
            ),
          },
        },
      };

    case actionTypes.MESSAGE_RECEIVE_SUCCESS:
      return {
        ...state,
        correspondents: {
          ...state.correspondents,
          [action.payload.address]: {
            ...state.correspondents[action.payload.address],
            messages: [
              ...state.correspondents[action.payload.address].messages,
              {
                _id: action.payload.id,
                type: action.payload.messageType,
                message: action.payload.message,
                hash: action.payload.messageHash,
                handleAs: action.payload.handleAs,
                timestamp: action.payload.timestamp,
                pending: false,
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
            walletAddress: null,
            messages:
              state.correspondents[action.payload.address]?.messages ?? [],
          },
        },
      };

    case actionTypes.CORRESPONDENT_DEVICE_REMOVE:
    case actionTypes.CORRESPONDENT_REMOVED_DEVICE:
      return {
        ...state,
        correspondents: {
          ...state.correspondents,
          [action.payload.address]: {
            ...state.correspondents[action.payload.address],
            walletAddress: null,
            visible: false,
          },
        },
      };

    case actionTypes.CORRESPONDENT_WALLET_ADDRESS_UPDATE:
      return {
        ...state,
        correspondents: {
          ...state.correspondents,
          [action.payload.address]: {
            ...state.correspondents[action.payload.address],
            walletAddress: action.payload.walletAddress,
          },
        },
      };

    case actionTypes.CORRESPONDENT_NAME_SET:
      return {
        ...state,
        correspondents: {
          ...state.correspondents,
          [action.payload.address]: {
            ...state.correspondents[action.payload.address],
            name: action.payload.name,
          },
        },
      };

    case actionTypes.CORRESPONDENT_CHAT_CLEAR:
      return {
        ...state,
        correspondents: {
          ...state.correspondents,
          [action.payload.address]: {
            ...state.correspondents[action.payload.address],
            messages: [],
          },
        },
      };

    default:
      return state;
  }
}

export default reducer;
