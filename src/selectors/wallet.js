import { createSelector } from 'reselect';

export const getWalletState = state => state.secure.wallet;

export const selectWallet = () =>
  createSelector(getWalletState, state => {
    return state;
  });

export const selectSeedWordsArray = () =>
  createSelector(getWalletState, state => state.seedWords.split(' '));

export const selectWalletAddress = () =>
  createSelector(getWalletState, state => state.address);

export const selectWalletWif = () =>
  createSelector(getWalletState, state => state.walletWif);

export const selectAddressWif = () =>
  createSelector(getWalletState, state => state.addressWif);

export const selectWitnesses = () =>
  createSelector(getWalletState, state => state.witnesses);
