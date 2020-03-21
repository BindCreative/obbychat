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

export const removeCorrespondent = ({ address }) => ({
  type: actionTypes.CORRESPONDENT_DEVICE_REMOVE,
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
