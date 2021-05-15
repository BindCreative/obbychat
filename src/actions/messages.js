import { actionTypes } from './../constants';

export const addMessageStart = (payload) => ({
  type: actionTypes.MESSAGE_ADD_START,
  payload
});

export const addMessageTemp = ({ id, address, pubKey, message, type }) => ({
  type: actionTypes.MESSAGE_ADD_TEMP,
  payload: { id, address, pubKey, message, type },
});

export const addMessageSuccess = (messageData) => ({
  type: actionTypes.MESSAGE_ADD_SUCCESS,
  payload: {
    ...messageData,
    handleAs: 'SENT'
  },
});

export const addMessageFail = ({ id }) => ({
  type: actionTypes.MESSAGE_ADD_FAIL,
  payload: { id },
});

export const receiveMessageStart = ({
  address,
  message,
  messageType,
  messageHash,
  handleAs,
  timestamp,
}) => ({
  type: actionTypes.MESSAGE_RECEIVE_START,
  payload: { address, message, messageType, messageHash, handleAs, timestamp },
});

export const receiveMessageSuccess = ({
  id,
  address,
  message,
  messageType,
  messageHash,
  handleAs,
  timestamp,
}) => ({
  type: actionTypes.MESSAGE_RECEIVE_SUCCESS,
  payload: {
    id,
    address,
    message,
    messageType,
    messageHash,
    handleAs,
    timestamp,
  },
});

export const receiveMessageFail = () => ({
  type: actionTypes.MESSAGE_RECEIVE_FAIL,
});

export const removeMessage = ({ address, messageHash }) => ({
  type: actionTypes.MESSAGE_REMOVE,
  payload: { address, messageHash },
});

export const setUnreadMessages = unreadMessages => ({
  type: actionTypes.UNREAD_MESSAGE_COUNT_SET,
  payload: { unreadMessages },
});

export const botsAddSuccess = bots => ({
  type: actionTypes.BOTS_ADD_SUCCESS,
  payload: bots
});

export const botPairSuccess = id => ({
  type: actionTypes.BOT_PAIR_SUCCESS,
  payload: id
});

export const openPaymentFromChat = id => ({
  type: actionTypes.OPEN_PAYMENT_FROM_CHAT,
  payload: id
});
