import { actionTypes } from './../constants';

export const addMessageStart = ({ address, pubKey, message, type }) => ({
  type: actionTypes.MESSAGE_ADD_START,
  payload: { address, pubKey, message, type },
});

export const addMessageSuccess = ({
  address,
  messageType,
  message,
  messageHash,
  timestamp,
}) => ({
  type: actionTypes.MESSAGE_ADD_SUCCESS,
  payload: {
    address,
    messageType,
    message,
    messageHash,
    handleAs: 'SENT',
    timestamp,
  },
});

export const addMessageFail = () => ({
  type: actionTypes.MESSAGE_ADD_FAIL,
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
  address,
  message,
  messageType,
  messageHash,
  handleAs,
  timestamp,
}) => ({
  type: actionTypes.MESSAGE_RECEIVE_SUCCESS,
  payload: { address, message, messageType, messageHash, handleAs, timestamp },
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
