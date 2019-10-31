import { createSelector } from 'reselect';
import { getWalletState, selectWalletAddress } from './wallet';


export const getWalletHistoryState = (state) => state.main.walletHistory;

export const selectWalletHistory = () => createSelector(
  getWalletHistoryState,
  state => state.history,
);

export const selectTransactions = () => createSelector(
  [
    getWalletHistoryState,
    getWalletState,
    selectWalletAddress(),
  ],
  (walletHistory, wallet, walletAddress) => {
    if (!walletHistory.history || !walletHistory.history.joints) {
      return [];
    }
    let transactions = [];
    for (let [ij, joint] of walletHistory.history.joints.entries()) {
      let amount = 0;
      let type;
      let toAddress = [];
      let fromAddress =  joint.unit.authors.reduce((combinedValue, value) => {
        combinedValue.push(value.address);
        return combinedValue;
      }, []);


      for (let [ia, author] of joint.unit.authors.entries()) {
        type = walletAddress === author.address ? 'SENT' : 'RECEIVED';
      }

      for (let [im, message] of joint.unit.messages.entries()) {
        for (let [io, output] of message.payload.outputs.entries()) {
          if (type === 'RECEIVED' && walletAddress === output.address) {
            amount += output.amount;
          } else if (type === 'SENT' && !walletAddress === output.address) {
            amount += output.amount;
            toAddress.push(output.address);
          }
        }
      }
      
      transactions.push({
        toAddress,
        fromAddress,
        amount,
        type,
        unitId: joint.unit.unit,
        timestamp: joint.unit.timestamp,
        headersCommission: joint.unit.headers_commission,
        payloadCommission: joint.unit.payload_commission,
        totalCommission: joint.unit.headers_commission + joint.unit.payload_commission,
      });
    }
    return transactions;
  }
);