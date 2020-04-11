import { createSelector } from 'reselect';
import { toWif, fromWif, getChash160 } from 'obyte/lib/utils';
import Mnemonic from 'bitcore-mnemonic';
import { testnet } from './../lib/oCustom';

export const getWalletState = state => state.secure.wallet;

export const selectWallet = () =>
  createSelector(getWalletState, state => state);

export const selectSeedWordsArray = () =>
  createSelector(getWalletState, state => state.seedWords.split(' '));

export const selectWalletAddress = () =>
  createSelector(getWalletState, state => {
    const mnemonic = new Mnemonic(state.seedWords);
    const xPrivKey = mnemonic.toHDPrivateKey();
    const addressPath = testnet ? "m/44'/1'/0'/0/0" : "m/44'/0'/0'/0/0";
    const { privateKey } = xPrivKey.derive(addressPath);
    const publicKey = privateKey.publicKey.toBuffer().toString('base64');
    const address = getChash160(['sig', { pubkey: publicKey }]);
    return address;
  });

export const selectWalletWif = () =>
  createSelector(getWalletState, state => {
    const mnemonic = new Mnemonic(state.seedWords);
    const xPrivKey = mnemonic.toHDPrivateKey();
    const path = testnet ? "m/44'/1'/0'/0" : "m/44'/0'/0'/0";
    const { privateKey } = xPrivKey.derive(path);
    const walletPrivKeyBuf = privateKey.bn.toBuffer({ size: 32 });
    const walletWif = toWif(walletPrivKeyBuf, testnet);
    return walletWif;
  });

export const selectAddressWif = () =>
  createSelector(getWalletState, state => {
    const mnemonic = new Mnemonic(state.seedWords);
    const xPrivKey = mnemonic.toHDPrivateKey();
    const path = testnet ? "m/44'/1'/0'/0/0" : "m/44'/0'/0'/0/0";
    const { privateKey } = xPrivKey.derive(path);
    const walletPrivKeyBuf = privateKey.bn.toBuffer({ size: 32 });
    const walletWif = toWif(walletPrivKeyBuf, testnet);
    return walletWif;
  });

export const selectWitnesses = () =>
  createSelector(getWalletState, state => state.witnesses);
