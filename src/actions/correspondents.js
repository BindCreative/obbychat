import { actionTypes } from './../constants';

export const addCorrespondent = ({
  address,
  name,
  hub,
  pubKey,
  pairingSecret,
  reversePairingSecret,
}) => ({
  type: actionTypes.CORRESPONDENT_DEVICE_ADD,
  payload: { address, name, hub, pubKey, pairingSecret, reversePairingSecret },
});

export const addCorrespondentFail = () => ({
  type: actionTypes.CORRESPONDENT_DEVICE_ADD_FAIL
});

export const removeCorrespondent = ({ address }) => ({
  type: actionTypes.CORRESPONDENT_DEVICE_REMOVE,
  payload: { address },
});

export const correspondentRemovedDevice = ({ address }) => ({
  type: actionTypes.CORRESPONDENT_REMOVED_DEVICE,
  payload: { address },
});

export const updateCorrespondentWalletAddress = ({
  address,
  walletAddress,
}) => ({
  type: actionTypes.CORRESPONDENT_WALLET_ADDRESS_UPDATE,
  payload: { address, walletAddress },
});

export const setCorrespondentName = ({ name, address }) => ({
  type: actionTypes.CORRESPONDENT_NAME_SET,
  payload: { name, address },
});

export const acceptInvitation = (payload) => ({
  type: actionTypes.CORRESPONDENT_INVITATION_ACCEPT,
  payload,
});

export const clearChatHistory = ({ address }) => ({
  type: actionTypes.CORRESPONDENT_CHAT_CLEAR,
  payload: { address },
});
