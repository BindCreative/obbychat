import { createSelector } from 'reselect';
import { toWif, fromWif, getChash160 } from 'obyte/lib/utils';
import { publicKeyCreate } from 'secp256k1';
import Crypto from 'crypto';
import Mnemonic from 'bitcore-mnemonic';
import { testnet } from './../lib/Wallet';


export const getWalletState = (state) => state.secure.wallet;

export const selectWallet = () => createSelector(
  getWalletState,
  state => state,
);

export const selectSeedWordsArray = () => createSelector(
  getWalletState,
  state => state.seedWords.split(' '),
);

export const selectWalletAddress = () => createSelector(
  getWalletState,
  state => {
    const mnemonic = new Mnemonic(state.seedWords);
    const xPrivKey = mnemonic.toHDPrivateKey();
    const addressPath = testnet ? "m/44'/1'/0'/0/0" : "m/44'/0'/0'/0/0";
    const { privateKey } = xPrivKey.derive(addressPath);
    const publicKey = privateKey.publicKey.toBuffer().toString('base64');
    const address = getChash160(['sig', { pubkey: publicKey }]);
    return address;
  },
);

export const selectDeviceAddress = () => createSelector(
  getWalletState,
  selectDeviceWif(),
  (state, deviceWif) => {
    const devicePrivKey = fromWif(deviceWif, testnet).privateKey;
    const devicePubKey = publicKeyCreate(devicePrivKey, true).toString('base64');
    const myDeviceAddress = `0${devicePubKey}`;
    return myDeviceAddress;
  },
);

export const selectWalletWif = () => createSelector(
  getWalletState,
  state => {
    const mnemonic = new Mnemonic(state.seedWords);
    const xPrivKey = mnemonic.toHDPrivateKey();
    const path = testnet ? "m/44'/1'0'" : "m/44'/0'0'";
    const { privateKey } = xPrivKey.derive(path);
    const walletPrivKeyBuf = privateKey.bn.toBuffer({ size: 32 });
    const walletWif = toWif(walletPrivKeyBuf, testnet);
    return walletWif;
  }
);

export const selectAddressWif = () => createSelector(
  getWalletState,
  state => {
    const mnemonic = new Mnemonic(state.seedWords);
    const xPrivKey = mnemonic.toHDPrivateKey();
    const path = testnet ? "m/44'/1'0'/0/0" : "m/44'/0'0'/0/0";
    const { privateKey } = xPrivKey.derive(path);
    const walletPrivKeyBuf = privateKey.bn.toBuffer({ size: 32 });
    const walletWif = toWif(walletPrivKeyBuf, testnet);
    return walletWif;
  }
);

export const selectDeviceWif = () => createSelector(
  getWalletState,
  state => {
    const mnemonic = new Mnemonic(state.seedWords);
    const xPrivKey = mnemonic.toHDPrivateKey();
    const path = testnet ? "m/44'/1'" : "m/44'/0'";
    const { privateKey } = xPrivKey.derive(path);
    const walletPrivKeyBuf = privateKey.bn.toBuffer({ size: 32 });
    const walletWif = toWif(walletPrivKeyBuf, testnet);
    return walletWif;
  }
);

export const selectDevicePrivKey = () => createSelector(
  selectDeviceWif(),
  wif => {
    return fromWif(wif, testnet).privateKey;
  }
);

export const selectDevicePubKey = () => createSelector(
  selectDevicePrivKey(),
  privKey => {
    return publicKeyCreate(privKey, true).toString('base64');
  }
);

export const selectPermanentDeviceKeyObj = () => createSelector(
  selectDevicePrivKey(),
  selectDevicePubKey(),
  (priv, pub_b64) => {
    return { priv, pub_b64 };
  }
);

export const selectWitnesses = () => createSelector(
  getWalletState,
  state => state.witnesses,
);