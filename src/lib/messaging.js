import { isValidAddress } from 'obyte/lib/utils';

export const regexWalletAddress = /^([A-Z0-9]{32})$/g;
export const regexPaymentRequest = /\[.*?\]\(((?:byteball-tn|byteball|obyte-tn|obyte):([0-9A-Z]{32})(?:\?([\w=&;+%]+))?)\)/g;
export const regexTextcoin = /\[.*?\]\(((?:byteball-tn|byteball|obyte-tn|obyte):textcoin\?(.+))\)/g;
export const regexData = /\[.*?\]\(((?:byteball-tn|byteball|obyte-tn|obyte):data\?(.+))\)/g;

export const parseTextMessage = originalText => {
  let type = null;
  const parsedText = originalText
    .replace(regexWalletAddress, (str, address) => {
      type = 'WALLET_ADDRESS';
      return address;
    })
    .replace(regexPaymentRequest, (str, payload, address, params) => {
      type = 'REQUEST_PAYMENT';
      return `Payment request: ${params}\n${address}`;
    })
    .replace(regexTextcoin, str => {
      type = 'TEXTCOINT';
      return '[UNSUPPORTED ACTION]';
    })
    .replace(regexData, str => {
      type = 'DATA';
      return '[UNSUPPORTED ACTION]';
    });

  return { originalText, parsedText, type };
};
