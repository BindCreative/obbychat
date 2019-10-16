import { createSelector } from 'reselect';


export const getWalletState = (state) => state.secure.wallet;

export const selectWallet = () => createSelector(
  getWalletState,
  state => state,
);

export const selectSeedWordsArray = () => createSelector(
  getWalletState,
  state => state.seedWords.split(' '),
);

export const selectInitialAddress = () => createSelector(
  getWalletState,
  state => state.addresses.length ? state.addresses[0] : null,
);

export const selectAddresses = () => createSelector(
  getWalletState,
  state => state.addresses,
);

export const selectWitnesses = () => createSelector(
  getWalletState,
  state => state.witnesses,
);