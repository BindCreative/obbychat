import { createSelector } from 'reselect';
import { selectWalletAddress } from './wallet';

export const getBalancesState = state => state.main.balances;

export const selectWalletBalances = (
  walletAddress = null,
  includePending = false,
) =>
  createSelector(
    [getBalancesState, selectWalletAddress()],
    (balancesState, currentWalletAddress) => {
      const wallet = walletAddress ? walletAddress : currentWalletAddress;
      if (balancesState[wallet]) {
        let total = 0;
        for (let [key, value] of Object.entries(balancesState[wallet])) {
          total += value.stable + value.pending;
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

export const selectBalancesLoading = () =>
  createSelector(getBalancesState, state => state.loading);
