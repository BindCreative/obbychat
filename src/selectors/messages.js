import { createSelector } from 'reselect';
import _ from 'lodash';

import { selectTransactions } from "./walletHistory";

export const getMessagesState = state => state.main.messages;

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

const emptyArray = [];

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
