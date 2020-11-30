import { getSignedMessageInfoFromJsonBase64 } from './oCustom';

export const REG_WALLET_ADDRESS = /^([A-Z0-9]{32})$/g;
export const REG_REQUEST_PAYMENT = /\[.*?\]\(((?:byteball-tn|byteball|obyte-tn|obyte):([0-9A-Z]{32})(?:\?([\w=&;+%]+))?)\)/g;
export const REGEX_SIGN_MESSAGE_REQUEST = /\[(.+?)\]\(sign-message-request(-network-aware)?:(.+?)\)/g;
export const REGEX_SIGNED_MESSAGE = /\[(.+?)\]\(signed-message:([\w\/+=]+?)\)/g;
export const REGEX_PAIRING = /(byteball-tn|byteball|obyte-tn|obyte):([\w\/+]{44})@([\w.:\/-]+)#(.+)/g;
export const REGEX_URL = /\bhttps?:\/\/[\w+&@#/%?=~|!:,.;-]+[\w+&@#/%=~|-]/g;
export const REGEX_COMMAND = /\[(.+?)\]\(command:(.+?)\)/g;
export const REGEX_SUGGEST_COMMAND = /\[(.+?)\]\(suggest-command:(.+?)\)/g;

// Unsupported messages
export const REG_TEXTCOINT = /\[.*?\]\(((?:byteball-tn|byteball|obyte-tn|obyte):textcoin\?([a-z-]+))\)/g;
export const REGEX_DATA = /\[.*?\]\(((?:byteball-tn|byteball|obyte-tn|obyte):data\?(.+))\)/g;
export const REGEX_PAYMENT = /\[(.+?)\]\(payment:([\w\/+=]+?)\)/g;
export const REGEX_VOTE = /\[(.+?)\]\(vote:([\w\/+=]+?)\)/g;
export const REGEX_PROFILE = /\[(.+?)\]\(profile:([\w\/+=]+?)\)/g;
export const REGEX_PROFILE_REQUEST = /\[(.+?)\]\(profile-request:([\w,]+?)\)/g;
export const REGEX_PROSAIC_CONTRACT = /\(prosaic-contract:([\w\/+=]+?)\)/g;

export const parseTextMessage = originalText => {
  let type = null;
  let params = {};

  const parsedText = originalText
    .replace(REG_TEXTCOINT, () => {
      type = 'TEXTCOINT';
      return '[UNSUPPORTED ACTION]';
    })
    .replace(REGEX_DATA, () => {
      type = 'DATA';
      return '[UNSUPPORTED ACTION]';
    })
    .replace(REGEX_DATA, () => {
      type = 'REGEX_PAYMENT';
      return '[UNSUPPORTED ACTION]';
    })
    .replace(REGEX_DATA, () => {
      type = 'REGEX_VOTE';
      return '[UNSUPPORTED ACTION]';
    })
    .replace(REGEX_DATA, () => {
      type = 'REGEX_PROFILE';
      return '[UNSUPPORTED ACTION]';
    })
    .replace(REGEX_DATA, () => {
      type = 'REGEX_PROFILE_REQUEST';
      return '[UNSUPPORTED ACTION]';
    })
    .replace(REGEX_DATA, () => {
      type = 'REGEX_PROSAIC_CONTRACT';
      return '[UNSUPPORTED ACTION]';
    })
    .replace(REG_WALLET_ADDRESS, (str, address) => {
      type = 'WALLET_ADDRESS';
      params = { address };
      return address;
    })
    .replace(REG_REQUEST_PAYMENT, (str, payload, address, amount) => {
      type = 'REQUEST_PAYMENT';
      params = { amount, address };
      return `Payment request: ${amount}\n${address}`;
    })
    .replace(
      REGEX_SIGN_MESSAGE_REQUEST,
      (str, description, networkAware, messageToSign) => {
        type = 'SIGN_MESSAGE_REQUEST';
        params = { messageToSign };
        return `Request to sign message: \"${messageToSign}\"`;
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

      return `Signed message: ${text}`;
    })
    .replace(REGEX_URL, (str, description, url) => {
      type = "URL";
      return url;
    })
    .replace(REGEX_COMMAND, (str, description, command) => {
      type = "COMMAND";
      return command;
    })
    .replace(REGEX_SUGGEST_COMMAND, (str, description, command) => {
      type = "SUGGEST_COMMAND";
      return command;
    })
    .replace(REGEX_URL, (str, description, url) => {
      type = "URL";
      return url;
    });

  return { originalText, parsedText, type, params };
};
