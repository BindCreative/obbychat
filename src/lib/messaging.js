import { isValidAddress } from 'obyte/lib/utils';

export const REG_WALLET_ADDRESS = /^([A-Z0-9]{32})$/g;
export const REG_REQUEST_PAYMENT = /\[.*?\]\(((?:byteball-tn|byteball|obyte-tn|obyte):([0-9A-Z]{32})(?:\?([\w=&;+%]+))?)\)/g;
export const REG_TEXTCOINT = /\[.*?\]\(((?:byteball-tn|byteball|obyte-tn|obyte):textcoin\?(.+))\)/g;
export const REGEX_DATA = /\[.*?\]\(((?:byteball-tn|byteball|obyte-tn|obyte):data\?(.+))\)/g;
export const REGEX_SIGN_MESSAGE_REQUEST = /\[(.+?)\]\(sign-message-request(-network-aware)?:(.+?)\)/g;
export const REGEX_SIGNED_MESSAGE = /\[(.+?)\]\(signed-message:(.+?)\)/g;

export const parseTextMessage = originalText => {
  let type = null;
  const parsedText = originalText
    .replace(REG_WALLET_ADDRESS, (str, address) => {
      type = 'WALLET_ADDRESS';
      return address;
    })
    .replace(REG_REQUEST_PAYMENT, (str, payload, address, params) => {
      type = 'REQUEST_PAYMENT';
      return `Payment request: ${params}\n${address}`;
    })
    .replace(REG_TEXTCOINT, str => {
      type = 'TEXTCOINT';
      return '[UNSUPPORTED ACTION]';
    })
    .replace(REGEX_DATA, str => {
      type = 'DATA';
      return '[UNSUPPORTED ACTION]';
    })
    .replace(REGEX_SIGN_MESSAGE_REQUEST, (str, description, messageToSign) => {
      type = 'SIGN_MESSAGE_REQUEST';
      return `Request to sign message: ${messageToSign}`;
    })
    .replace(REGEX_SIGNED_MESSAGE, (str, description, signedMessageBase64) => {
      type = 'SIGN_MESSAGE_REQUEST';
      // TODO: parsing
      return `Signed message: ${signedMessageBase64}`;
    });

  return { originalText, parsedText, type };
};
