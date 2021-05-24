import { createSelector } from 'reselect';

export const getSecureState = state => state.secure;

export const selectSeedWords = () =>
  createSelector(getSecureState, state => state.seedWords);

export const selectSeedWordsArray = () =>
  createSelector(getSecureState, state => state.seedWords.split(' '));

export const selectPasswordProtected = () =>
  createSelector(getSecureState, state => state.passwordProtected);
