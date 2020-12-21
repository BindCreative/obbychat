import crypto from 'react-native-crypto';
import { getChash160, isValidAddress } from 'obyte/lib/utils';
import { getSignedMessageInfoFromJsonBase64 } from './oCustom';

export const REGEX_WALLET_ADDRESS = /(.*?\b|^)([2-7A-Z]{32})([\s.,;!:].*?|$)/g;
export const REGEX_REQUEST_PAYMENT = /\[.*?\]\(((?:byteball-tn|byteball|obyte-tn|obyte):([0-9A-Z]{32})(?:\?([\w=&;+%]+))?)\)/g;
export const REGEX_SIGN_MESSAGE_REQUEST = /\[(.+?)\]\(sign-message-request(-network-aware)?:(.+?)\)/g;
export const REGEX_SIGNED_MESSAGE = /\[(.+?)\]\(signed-message:([\w\/+=]+?)\)/g;
export const REGEX_PAIRING = /(byteball-tn|byteball|obyte-tn|obyte):([\w\/+]{44})@([\w.:\/-]+)#(.+)/g;
export const REGEX_URL = /\bhttps?:\/\/[\w+&@#/%?=~|!:,.;-]+[\w+&@#/%=~|-]/g;
export const REGEX_COMMAND = /\[(.+?)\]\(command:(.+?)\)/g;
export const REGEX_SUGGEST_COMMAND = /\[(.+?)\]\(suggest-command:(.+?)\)/g;

// Unsupported messages
export const REGEX_TEXTCOIN = /\[.*?\]\(((?:byteball-tn|byteball|obyte-tn|obyte):textcoin\?([a-z-]+))\)/g;
export const REGEX_DATA = /\[.*?\]\(((?:byteball-tn|byteball|obyte-tn|obyte):data\?(.+))\)/g;
export const REGEX_PAYMENT = /\[(.+?)\]\(payment:([\w\/+=]+?)\)/g;
export const REGEX_VOTE = /\[(.+?)\]\(vote:([\w\/+=]+?)\)/g;
export const REGEX_PROFILE = /\[(.+?)\]\(profile:([\w\/+=]+?)\)/g;
export const REGEX_PROFILE_REQUEST = /\[(.+?)\]\(profile-request:([\w,]+?)\)/g;
export const REGEX_PROSAIC_CONTRACT = /\(prosaic-contract:([\w\/+=]+?)\)/g;

export const parseTextMessage = originalText => {
  let type = null;
  let params = {};
  const actions = {};
  let index = crypto.randomBytes(4).readUInt32BE(0);
  const toDelayedReplacement = (data) => {
    index++;
    const key = `{${index}}`;
    actions[key] = data;
    return key;
  };

  const parsedText = originalText
    .replace(REGEX_TEXTCOIN, () => {
      type = 'TEXTCOIN';
      return toDelayedReplacement({ type, text: '[UNSUPPORTED ACTION]' });
    })
    .replace(REGEX_DATA, () => {
      type = 'DATA';
      return toDelayedReplacement({ type, text: '[UNSUPPORTED ACTION]' });
    })
    .replace(REGEX_PAYMENT, () => {
      type = 'PAYMENT';
      return toDelayedReplacement({ type, text: '[UNSUPPORTED ACTION]' });
    })
    .replace(REGEX_VOTE, () => {
      type = 'VOTE';
      return toDelayedReplacement({ type, text: '[UNSUPPORTED ACTION]' });
    })
    .replace(REGEX_PROFILE, () => {
      type = 'PROFILE';
      return toDelayedReplacement({ type, text: '[UNSUPPORTED ACTION]' });
    })
    .replace(REGEX_PROFILE_REQUEST, () => {
      type = 'PROFILE_REQUEST';
      return toDelayedReplacement({ type, text: '[UNSUPPORTED ACTION]' });
    })
    .replace(REGEX_PROSAIC_CONTRACT, () => {
      type = 'PROSAIC_CONTRACT';
      return toDelayedReplacement({ type, text: '[UNSUPPORTED ACTION]' });
    })
    .replace(REGEX_WALLET_ADDRESS, (str, pre, address, post) => {
      type = 'WALLET_ADDRESS';
      return `${pre}${toDelayedReplacement({ type, address })}${post}`;
    })
    .replace(REGEX_REQUEST_PAYMENT, (str, payload, address, amount) => {
      type = 'REQUEST_PAYMENT';
      return toDelayedReplacement({ type, address, amount });
    })
    .replace(
      REGEX_SIGN_MESSAGE_REQUEST,
      (str, description, networkAware, messageToSign) => {
        type = 'SIGN_MESSAGE_REQUEST';
        return toDelayedReplacement({ type, messageToSign });
      },
    )
    .replace(REGEX_SIGNED_MESSAGE, (str, description, signedMessageBase64) => {
      type = 'SIGNED_MESSAGE';
      const info = getSignedMessageInfoFromJsonBase64(signedMessageBase64);
      const { objSignedMessage } = info;
      let text =
        typeof objSignedMessage.signed_message === 'string'
          ? `\"${objSignedMessage.signed_message}\"`
          : `\"${JSON.stringify(objSignedMessage.signed_message, null, '\t')}\"`;

      text += info.valid ? ' (valid)' : ' (invalid)';
      return toDelayedReplacement({ type, text });
    })
    .replace(REGEX_URL, (url) => {
      type = "URL";
      return toDelayedReplacement({ type, url });
    })
    .replace(REGEX_COMMAND, (str, description, command) => {
      type = "COMMAND";
      return toDelayedReplacement({ type, description, command });
    })
    .replace(REGEX_SUGGEST_COMMAND, (str, description, command) => {
      type = "SUGGEST_COMMAND";
      return toDelayedReplacement({ type, description, command });
    });

  return { originalText, parsedText, actions };
};
