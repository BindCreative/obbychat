import _ from 'lodash';
import { REHYDRATE } from 'redux-persist';
import { actionTypes } from './../constants';

const initialState = {
  correspondents: {},
  unreadMessages: 0,
  addFetching: false,
  bots: []
};

const isMessageExist = (list, message) => list.some(({ hash }) => hash === message.messageHash);

function reducer(state = initialState, action) {
  switch (action.type) {
    case REHYDRATE:
      return _.get(action, 'payload.messages', state);

    case actionTypes.UNREAD_MESSAGE_COUNT_SET:
      return {
        ...state,
        ...action.payload,
      };

    case actionTypes.CORRESPONDENT_INVITATION_ACCEPT:
      return {
        ...state,
        addFetching: true
      };

    case actionTypes.CORRESPONDENT_DEVICE_ADD_FAIL:
      return {
        ...state,
        addFetching: false
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
                    sendingError: action.payload.sendingError,
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

    case actionTypes.MESSAGE_RECEIVE_SUCCESS: {
      if (isMessageExist(state.correspondents[action.payload.address].messages, action.payload)) {
        console.log('message not unique: ', action.payload);
        return state;
      } else {
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
      }
    }

    case actionTypes.MESSAGE_REMOVE:
      return {
        ...state,
        correspondents: {
          ...state.correspondents,
          [action.payload.address]: {
            ...state.correspondents[action.payload.address],
            messages: [
              ...state.correspondents[action.payload.address].messages.filter(
                message => message.hash !== action.payload.messageHash,
              ),
            ],
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
        addFetching: false
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

    case actionTypes.BOTS_ADD_SUCCESS: {
      const botsIds = state.bots.map(({ id }) => id);
      const newBots = action.payload.filter(({ id }) => !botsIds.includes(id));
      const bots = [...state.bots, ...newBots].map(bot => ({ ...bot, type: 'bot' }));
      return { ...state, bots };
    }

    case actionTypes.BOT_PAIR_SUCCESS:
      return {
        ...state,
        bots: state.bots.map(bot => bot.id === action.payload ? { ...bot, paired: true } : bot)
      };


    default:
      return state;
  }
}

export default reducer;
