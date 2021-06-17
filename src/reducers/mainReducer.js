import * as Crypto from "react-native-crypto";
import { REHYDRATE } from 'redux-persist';
import { actionTypes } from '../constants';
import {REGEX_PAIRING} from "../lib/messaging";

export const accountTemplate = {
  deviceTempKeys: {
    prevPrivKey: Crypto.randomBytes(32),
    privKey: Crypto.randomBytes(32),
    rotationTimestamp: Date.now(),
  },
  balances: {
    loading: false
  },
  exchangeRates: {
    BTC_USD: null,
    GBB_BTC: null,
    GBB_GBYTE: null,
    GBB_USD: null,
    GBYTE_USD: null,
    MBYTE_USD: null,
    kBYTE_USD: null,
    BYTE_USD: null,
    updated: null
  },
  walletHistory: null,
  settings: {
    unitSize: 'MB', // B | kB | MB | GB
  },
  messages: {
    correspondents: {},
    unreadMessages: 0,
    addFetching: false,
    bots: []
  }
};

const initialState = {};

const isMessageExist = (list, message) => list.some(({ hash }) => hash === message.messageHash);

function reducer(state = initialState, action) {
  const { type, payload, mainKey } = action;
  switch (type) {
    case REHYDRATE: {
      if (action.key === 'main') {
        return {
          ...state,
          ...action.payload
        };
      } else {
        return state;
      }
    }

    case actionTypes.INIT_DEVICE_SUCCESS:
      return { ...state, [payload]: accountTemplate };

    case actionTypes.DEVICE_TEMP_KEY_ROTATE:
      return {
        ...state,
        [mainKey]: {
          ...state[mainKey],
          deviceTempKeys: {
            ...state[mainKey].deviceTempKeys,
            privKey: Crypto.randomBytes(32),
            prevPrivKey: state.deviceTempKeys.privKey ?? Crypto.randomBytes(32),
            rotationTimestamp: Date.now()
          }
        }
      };

    case actionTypes.WALLET_BALANCES_FETCH_START:
      return {
        ...state,
        [mainKey]: {
          ...state[mainKey],
          balances: {
            ...state[mainKey].balances,
            loading: true
          }
        }
      };

    case actionTypes.WALLET_BALANCES_FETCH_SUCCESS:
      return {
        ...state,
        [mainKey]: {
          ...state[mainKey],
          balances: {
            ...state[mainKey].balances,
            ...payload,
            loading: false
          }
        }
      };

    case actionTypes.WALLET_BALANCES_FETCH_FAILED:
      return {
        ...state,
        [mainKey]: {
          ...state[mainKey],
          balances: {
            ...state[mainKey].balances,
            loading: false
          }
        }
      };

    case actionTypes.EXCHANGE_RATES_SET:
      return {
        ...state,
        [mainKey]: {
          ...state[mainKey],
          exchangeRates: {
            ...state[mainKey].exchangeRates,
            ...payload
          }
        }
      };

    case actionTypes.WALLET_HISTORY_GET_SUCCESS:
      return {
        ...state,
        [mainKey]: {
          ...state[mainKey],
          walletHistory: payload
        }
      };

    case actionTypes.WALLET_HISTORY_GET_FAILED:
      return {
        ...state,
        [mainKey]: {
          ...state[mainKey],
          walletHistory: null
        }
      };

    case actionTypes.SETTINGS_SET:
      return {
        ...state,
        [mainKey]: {
          ...state[mainKey],
          settings: {
            ...state[mainKey].settings,
            ...payload
          }
        }
      };

    case actionTypes.UNREAD_MESSAGE_COUNT_SET:
      return {
        ...state,
        [mainKey]: {
          ...state[mainKey],
          messages: {
            ...state[mainKey].messages,
            ...payload
          }
        }
      };

    case actionTypes.CORRESPONDENT_INVITATION_ACCEPT:
      return {
        ...state,
        [mainKey]: {
          ...state[mainKey],
          messages: {
            ...state[mainKey].messages,
            addFetching: true
          }
        }
      };

    case actionTypes.CORRESPONDENT_DEVICE_ADD_FAIL:
      return {
        ...state,
        [mainKey]: {
          ...state[mainKey],
          messages: {
            ...state[mainKey].messages,
            addFetching: false
          }
        }
      };

    case actionTypes.MESSAGE_ADD_TEMP:
      return {
        ...state,
        [mainKey]: {
          ...state[mainKey],
          messages: {
            ...state[mainKey].messages,
            correspondents: {
              ...state[mainKey].messages.correspondents,
              [payload.address]: {
                ...state[mainKey].messages.correspondents[payload.address],
                messages: [
                  ...state[mainKey].messages.correspondents[payload.address].messages,
                  {
                    _id: payload.id,
                    address: payload.address,
                    message: payload.message,
                    type: payload.type,
                    timestamp: payload.timestamp,
                    handleAs: 'SENT',
                    pending: true,
                  },
                ],
              },
            }
          }
        }
      };

    case actionTypes.MESSAGE_ADD_SUCCESS:
      return {
        ...state,
        [mainKey]: {
          ...state[mainKey],
          messages: {
            ...state[mainKey].messages,
            correspondents: {
              ...state[mainKey].messages.correspondents,
              [payload.address]: {
                ...state[mainKey].messages.correspondents[payload.address],
                messages: state[mainKey].messages.correspondents[payload.address].messages.map(
                  (message, i) => {
                    if (message._id === payload.id) {
                      return {
                        ...message,
                        type: payload.messageType,
                        message: payload.message,
                        hash: payload.messageHash,
                        handleAs: payload.handleAs,
                        timestamp: payload.timestamp,
                        sendingError: payload.sendingError,
                        pending: false,
                      };
                    }
                    return message;
                  },
                ),
              },
            }
          }
        }
      };

    case actionTypes.MESSAGE_ADD_FAIL:
      return {
        ...state,
        [mainKey]: {
          ...state[mainKey],
          messages: {
            ...state[mainKey].messages,
            correspondents: {
              ...state[mainKey].messages.correspondents,
              [payload.address]: {
                ...state[mainKey].messages.correspondents[payload.address],
                messages: state[mainKey].messages.correspondents[payload.address].messages.map(
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
            }
          }
        }
      };

    case actionTypes.MESSAGE_RECEIVE_SUCCESS: {
      if (isMessageExist(state[mainKey].messages.correspondents[payload.address].messages, payload)) {
        console.log('message not unique: ', action.payload);
        return state;
      } else {
        return {
          ...state,
          [mainKey]: {
            ...state[mainKey],
            messages: {
              ...state[mainKey].messages,
              correspondents: {
                ...state[mainKey].messages.correspondents,
                [payload.address]: {
                  ...state[mainKey].messages.correspondents[payload.address],
                  messages: [
                    ...state[mainKey].messages.correspondents[payload.address].messages,
                    {
                      _id: payload.id,
                      type: payload.messageType,
                      message: payload.message,
                      hash: payload.messageHash,
                      handleAs: payload.handleAs,
                      timestamp: payload.timestamp,
                      pending: false,
                    },
                  ],
                },
              }
            }
          }
        };
      }
    }

    case actionTypes.MESSAGE_REMOVE:
      return {
        ...state,
        [mainKey]: {
          ...state[mainKey],
          messages: {
            ...state[mainKey].messages,
            correspondents: {
              ...state[mainKey].messages.correspondents,
              [payload.address]: {
                ...state[mainKey].messages.correspondents[payload.address],
                messages: [
                  ...state[mainKey].messages.correspondents[payload.address].messages.filter(
                    message => message.hash !== payload.messageHash,
                  ),
                ],
              },
            }
          }
        }
      };

    case actionTypes.CORRESPONDENT_DEVICE_ADD:
      return {
        ...state,
        [mainKey]: {
          ...state[mainKey],
          messages: {
            ...state[mainKey].messages,
            correspondents: {
              ...state[mainKey].messages.correspondents,
              [payload.address]: {
                name: payload.name,
                hub: payload.hub,
                pubKey: payload.pubKey,
                pairingSecret: payload.pairingSecret,
                reversePairingSecret: payload.reversePairingSecret,
                visible: true,
                walletAddress: null,
                messages:
                  state[mainKey].messages.correspondents[payload.address]?.messages ?? [],
              },
            },
            addFetching: false
          }
        }
      };

    case actionTypes.CORRESPONDENT_DEVICE_REMOVE:
    case actionTypes.CORRESPONDENT_REMOVED_DEVICE: {
      const correspondentPubKey = state[mainKey].messages.correspondents[payload.address].pubKey;
      let botId = null;
      if (state[mainKey].messages.bots) {
        state[mainKey].messages.bots.some((bot) => {
          const { pairing_code } = bot;
          const pubKey = pairing_code.replace(
            REGEX_PAIRING,
            (str, pairingCode, correspondentPubKey) => correspondentPubKey,
          );
          if (pubKey === correspondentPubKey) {
            botId = bot.id;
            return true;
          }
          return false;
        });
      }

      const newState = {
        ...state,
        [mainKey]: {
          ...state[mainKey],
          messages: {
            ...state[mainKey].messages,
            correspondents: {
              ...state[mainKey].messages.correspondents,
              [payload.address]: {
                ...state[mainKey].messages.correspondents[payload.address],
                walletAddress: null,
                visible: false,
              },
            }
          }
        }
      };

      if (botId !== null && state[mainKey].messages.bots) {
        newState[mainKey].messages.bots = state[mainKey].messages.bots.map((bot) => bot.id === botId ? ({ ...bot, paired: false }) : bot);
      }

      return newState;
    }

    case actionTypes.CORRESPONDENT_WALLET_ADDRESS_UPDATE:
      return {
        ...state,
        [mainKey]: {
          ...state[mainKey],
          messages: {
            ...state[mainKey].messages,
            correspondents: {
              ...state[mainKey].messages.correspondents,
              [payload.address]: {
                ...state[mainKey].messages.correspondents[payload.address],
                walletAddress: payload.walletAddress,
              },
            }
          }
        }
      };

    case actionTypes.CORRESPONDENT_NAME_SET:
      return {
        ...state,
        [mainKey]: {
          ...state[mainKey],
          messages: {
            ...state[mainKey].messages,
            correspondents: {
              ...state[mainKey].messages.correspondents,
              [payload.address]: {
                ...state[mainKey].messages.correspondents[payload.address],
                name: action.payload.name,
              },
            }
          }
        }
      };

    case actionTypes.CORRESPONDENT_CHAT_CLEAR:
      return {
        ...state,
        [mainKey]: {
          ...state[mainKey],
          messages: {
            ...state[mainKey].messages,
            correspondents: {
              ...state[mainKey].messages.correspondents,
              [payload.address]: {
                ...state[mainKey].messages.correspondents[payload.address],
                messages: [],
              },
            }
          }
        }
      };

    case actionTypes.BOTS_ADD_SUCCESS: {
      const stateBots = state[mainKey].messages.bots || [];
      const botsIds = stateBots.map(({ id }) => id);
      const newBots = payload.filter(({ id }) => !botsIds.includes(id));
      const bots = [...stateBots, ...newBots].map(bot => ({ ...bot, type: 'bot' }));
      return {
        ...state,
        [mainKey]: {
          ...state[mainKey],
          messages: {
            ...state[mainKey].messages,
            bots
          }
        }
      };
    }

    case actionTypes.BOT_PAIR_SUCCESS:
      return {
        ...state,
        [mainKey]: {
          ...state[mainKey],
          messages: {
            ...state[mainKey].messages,
            bots: state[mainKey].messages.bots.map(bot => bot.id === payload ? { ...bot, paired: true } : bot)
          }
        }
      };

    case actionTypes.RESET_ACCOUNT:
    case actionTypes.RESTORE_ACCOUNT:
      return initialState;

    case actionTypes.SET_UNIT_SIZE:
      return {
        ...state,
        [mainKey]: {
          ...state[mainKey],
          settings: {
            ...state[mainKey].settings,
            unitSize: action.payload
          }
        }
      };

    default: return state;
  }
}
export default reducer;
