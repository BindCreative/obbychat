import { createSelector } from 'reselect';
import _ from 'lodash';

export const getMessagesState = state => state.main.messages;

export const selectCorrespondents = () =>
  createSelector(getMessagesState, state => {
    const correspondents = Object.keys(state.correspondents).map(
      (address, i) => {
        let correspondent = _.clone(state.correspondents[address]);
        if (address?.length === 33) {
          const lastMessageIndex = correspondent.messages.length - 1;
          correspondent.address = address;
          correspondent.lastMessagePreview =
            typeof correspondent?.messages[lastMessageIndex]?.message ===
            'string'
              ? correspondent.messages[lastMessageIndex].message
              : 'This message type is not yet supported.';
          correspondent.lastMessageTimestamp = correspondent?.messages?.length
            ? correspondent.messages[lastMessageIndex].timestamp
            : undefined;
          return correspondent;
        }
      },
    );
    return correspondents.filter(correspondent => {
      return typeof correspondent === 'object' && correspondent.visible;
    });
  });

export const selectCorrespondent = address =>
  createSelector(getMessagesState, state => {
    return state.correspondents[address];
  });

export const selectCorrespondentMessages = ({ address }) =>
  createSelector(getMessagesState, state => {
    let allMessages = _.clone(
      _.get(state, `correspondents[${address}].messages`, []),
    );
    const correspondentName = _.get(
      state,
      `correspondents[${address}].name`,
      'Correspondent',
    );
    allMessages = allMessages.map(message => {
      const unhandled =
        message.type !== 'text' || typeof message.message !== 'string';
      return {
        _id: message.hash,
        type: 'text',
        text: unhandled
          ? 'This message type is not yet supported.'
          : message.message ?? '',
        system: false,
        createdAt: message.timestamp,
        user:
          message.handleAs === 'SENT'
            ? { _id: 1, name: 'Me' }
            : { _id: address, name: correspondentName },
      };
    });
    return _.uniqBy(allMessages, message => message._id).reverse();
  });
