import { createSelector } from 'reselect';
import { getWalletState } from './wallet';


export const getBalancesState = (state) => state.main.balances;

export const selectWalletBalances = (walletAddress = null, includePending = false) => createSelector(
  [
    getBalancesState, 
    getWalletState,
  ],
  (balancesState, walletState) => {
    const wallet = walletAddress ? walletAddress : walletState.addresses[walletState.address];
    if (balancesState[wallet]) {
      let total = 0;
      for (let [key, value] of Object.entries(balancesState[wallet])) {
        total += value.stable;
        if (includePending) {
          total += value.pending;
        }
      }
      return total;
    } else {
      return 0;
    }
  },
);