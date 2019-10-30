import Mnemonic from 'bitcore-mnemonic';
import { createSelector } from 'reselect';
import { publicKeyCreate } from 'secp256k1';
import { toWif, fromWif } from 'obyte/lib/utils';
import { testnet } from './../lib/OCustom';
import { getWalletState } from './wallet';


export const getAppState = (state) => state.main.app;

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


export const selectDeviceTempKeyData = () => createSelector(
  getAppState,
  state => state.deviceTempKeys,
);