import { createSelector } from 'reselect';
import { selectWalletAddress } from './temporary';
import { publicKeyCreate } from 'secp256k1';
import _ from "lodash";

import { accountTemplate } from "../reducers/mainReducer";

const emptyArray = [];

export const selectMainReducer = () =>
  createSelector(
    state => state.main,
    main => main
  );

export const getMainKey = state => state.temporary.hashedWif;

export const getCurrentMain = state => state.main[getMainKey(state)] || accountTemplate;

export const getBalancesState = state => getCurrentMain(state).balances;

export const getDeviceState = state => getCurrentMain(state).deviceTempKeys;

export const getExchangeRatesState = state => getCurrentMain(state).exchangeRates;

export const getMessagesState = state => getCurrentMain(state).messages;

export const getSettingsState = state => getCurrentMain(state).settings;

export const getWalletHistoryState = state => getCurrentMain(state).walletHistory;

export const selectWalletBalances = (
  walletAddress = null,
  includePending = true,
) =>
  createSelector(
    [getBalancesState, selectWalletAddress()],
    (balancesState, currentWalletAddress) => {
      const wallet = walletAddress ? walletAddress : currentWalletAddress;
      if (balancesState[wallet] && balancesState[wallet].base) {
        let total = balancesState[wallet].base.stable;
        if (includePending) {
          total += balancesState[wallet].base.pending;
        }
        // for (let [key, value] of Object.entries(balancesState[wallet])) {
        //   total += value.stable;
        //   if (includePending) {
        //     total += value.pending;
        //   }
        // }
        return total;
      } else {
        return 0;
      }
    },
  );

export const selectBalancesLoading = () =>
  createSelector(getBalancesState, state => state.loading);

export const selectDeviceTempKeyData = () =>
  createSelector(getDeviceState, state => {
    return {
      ...state,
      pubB64: publicKeyCreate(
        Buffer.from(state.privKey),
        true,
      ).toString('base64'),
      prevPubB64: publicKeyCreate(
        Buffer.from(state.prevPrivKey),
        true,
      ).toString('base64'),
    };
  });

export const selectExchangeRates = () =>
  createSelector(getExchangeRatesState, state => ({
    ...state,
    MBYTE_USD: state.GBYTE_USD ? state.GBYTE_USD / 1000 : null,
    kBYTE_USD: state.GBYTE_USD ? state.GBYTE_USD / 1000000 : null,
    BYTE_USD: state.GBYTE_USD ? state.GBYTE_USD / 1000000000 : null,
    MBYTE_BTC: state.GBYTE_BTC ? state.GBYTE_BTC / 1000 : null,
    kBYTE_BTC: state.GBYTE_BTC ? state.GBYTE_BTC / 1000000 : null,
    BYTE_BTC: state.GBYTE_BTC ? state.GBYTE_BTC / 1000000000 : null,
  }));

export const selectCorrespondents = () =>
  createSelector(getMessagesState, state => {
    const correspondents = Object.keys(state.correspondents).map(
      (address, i) => {
        let correspondent = _.clone(state.correspondents[address]);
        if (!correspondent?.messages) {
          return [];
        }
        if (correspondent && address?.length === 33) {
          const lastMessageIndex = correspondent.messages.length - 1;
          correspondent.address = address;
          correspondent.lastMessagePreview =
            typeof correspondent?.messages[lastMessageIndex]?.message ===
            'string'
              ? correspondent.messages[lastMessageIndex].message
              : '';
          correspondent.lastMessageTimestamp = correspondent?.messages?.length
            ? correspondent.messages[lastMessageIndex].timestamp
            : undefined;
          return correspondent;
        }
      },
    );
    return correspondents
      .filter(correspondent => {
        return typeof correspondent === 'object' && correspondent.visible;
      })
      .sort(
        (c1, c2) =>
          c2.messages[c2.messages.length - 1]?.timestamp -
          c1.messages[c1.messages.length - 1]?.timestamp,
      );
  });

export const selectUnpairedBots = () =>
  createSelector(getMessagesState, state => state.bots ? state.bots.filter(({ paired }) => !paired) : emptyArray);

export const selectCorrespondent = address =>
  createSelector(getMessagesState, state => {
    return state.correspondents[address];
  });

export const selectCorrespondentFetching = () =>
  createSelector(getMessagesState, state => {
    return state.addFetching;
  });

export const selectCorrespondentByPairingSecret = pairingSecret =>
  createSelector(getMessagesState, state => {
    for (let key in state.correspondents) {
      if (state.correspondents[key].pairingSecret === pairingSecret) {
        return state.correspondents[key];
      }
    }
    return null;
  });

export const selectCorrespondentByPubKey = pubKey =>
  createSelector(getMessagesState, state => {
    for (let address in state.correspondents) {
      if (state.correspondents[address].pubKey === pubKey) {
        return { ...state.correspondents[address], address };
      }
    }
    return null;
  });

export const selectCorrespondentWalletAddress = address =>
  createSelector(getMessagesState, state => {
    return state.correspondents[address]?.walletAddress;
  });

export const selectCorrespondentMessages = ({ address }) =>
  createSelector(
    [getMessagesState, selectTransactions()],
    (state, transactions) => {
      let allMessages = _.get(state, `correspondents[${address}].messages`, []);
      const correspondentName =
        state.correspondents &&
        state.correspondents[address] &&
        state.correspondents[address].name
          ? state.correspondents[address].name
          : 'New';
      allMessages = allMessages.map(message => {
        const unhandled = !['text', 'payment_notification'].includes(message.type) || typeof message.message !== 'string';
        let messageData = {
          _id: message._id,
          type: message.type,
          text: unhandled ? 'This message type is not yet supported.' : message.message ?? '',
          sendingError: message.sendingError,
          hash: message.hash,
          system: false,
          createdAt: message.timestamp,
          user: message.handleAs === 'SENT' ? { _id: 1, name: 'Me' } : { _id: address, name: correspondentName },
        };

        if (message.type === 'payment_notification') {
          let transaction = null;
          transactions.some((joint) => {
            if (joint.unitId === message.message) {
              transaction = joint;
              return true;
            }
            return false;
          });
          if (transaction) {
            messageData.text = `[Payment notification](payment:${message.message} ${transaction.amount})`
          } else {
            messageData = null;
          }
        }

        return messageData;
      });
      allMessages = allMessages.filter(message => !!message);
      return _.uniqBy(allMessages, message => message._id).reverse();
    });

export const selectTransactions = () =>
  createSelector(
    [getWalletHistoryState, selectWalletAddress()],
    (walletHistory, walletAddress) => {
      if (!walletHistory || !walletHistory.joints) {
        return [];
      }
      let transactions = [];
      for (let [ij, joint] of walletHistory.joints.entries()) {
        const confirmed = !!joint.ball;
        let amount = 0;
        let asset = '';
        let type;
        let toAddress = [];
        let fromAddress = joint.unit.authors.reduce((combinedValue, value) => {
          combinedValue.push(value.address);
          return combinedValue;
        }, []);

        for (let [ia, author] of joint.unit.authors.entries()) {
          if (walletAddress === author.address) {
            type = 'MOVED';
            toAddress = [walletAddress];
            for (let [im, message] of joint.unit.messages.entries()) {
              if (message.payload.outputs) {
                for (let [io, output] of message.payload.outputs.entries()) {
                  if (walletAddress !== output.address) {
                    type = 'SENT';
                    toAddress = [];
                  }
                }
              }
            }
          } else {
            type = 'RECEIVED';
          }
        }

        for (let [im, message] of joint.unit.messages.entries()) {
          asset = message.payload.asset || 'base';
          amount = 0;
          if (message.payload.outputs) {
            for (let [io, output] of message.payload.outputs.entries()) {
              if (type === 'RECEIVED' && walletAddress === output.address) {
                amount += output.amount;
              } else if (type === 'SENT' && walletAddress !== output.address) {
                amount += output.amount;
                toAddress.push(output.address);
              } else if (type === 'MOVED' && walletAddress === output.address) {
                amount += output.amount;
              }
            }
            transactions.push({
              toAddress,
              fromAddress,
              amount,
              asset,
              type,
              unitId: joint.unit.unit,
              timestamp: joint.unit.timestamp,
              headersCommission: joint.unit.headers_commission,
              payloadCommission: joint.unit.payload_commission,
              totalCommission:
                joint.unit.headers_commission + joint.unit.payload_commission,
              confirmed
            });
          }
        }
      }
      return transactions;
    },
  );

export const selectTransactionByUnitId = (unitId) =>
  createSelector(
    [selectTransactions()],
    (transactions) => {
      let transaction = null;
      transactions.some((joint) => {
        if (joint.unitId === unitId) {
          transaction = joint;
          return true;
        }
        return false;
      });
      return transaction;
    });

export const selectUnitSize = () => createSelector(
  getSettingsState,
  ({ unitSize }) => unitSize
);

export const selectNotificationsEnabled = () => createSelector(
  getSettingsState,
  ({ notificationsEnabled }) => notificationsEnabled
);
