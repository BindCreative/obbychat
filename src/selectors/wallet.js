import { createSelector } from 'reselect';


export const walletState = (state) => state.secure.wallet;

export const selectWallet = () => createSelector(
  walletState,
  state => state,
);

export const selectSeedWordsArray = () => createSelector(
  walletState,
  state => state.seedWords.split(' '),
);