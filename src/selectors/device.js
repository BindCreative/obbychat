import Mnemonic from 'bitcore-mnemonic';
import { createSelector } from 'reselect';
import { publicKeyCreate } from 'secp256k1';
import { toWif, fromWif, getChash160 } from 'obyte/lib/utils';
import { testnet } from './../lib/oCustom';
import { getWalletState } from './wallet';

export const getDeviceState = state => state.main.device;

export const selectPrivKey = () =>
  createSelector(getDeviceState, state => Buffer.from(state.deviceTempKeys.privKey));

export const selectDeviceWif = () =>
  createSelector(getWalletState, state => {
    const mnemonic = new Mnemonic(state.seedWords);
    const xPrivKey = mnemonic.toHDPrivateKey();
    const path = testnet ? "m/44'/1'" : "m/44'/0'";
    const { privateKey } = xPrivKey.derive(path);
    const walletPrivKeyBuf = privateKey.bn.toBuffer({ size: 32 });
    return toWif(walletPrivKeyBuf, testnet);
  });

export const selectDeviceAddress = () =>
  createSelector(getWalletState, selectDeviceWif(), (state, deviceWif) => {
    const devicePrivKey = fromWif(deviceWif, testnet).privateKey;
    const devicePubKey = publicKeyCreate(devicePrivKey, true).toString(
      'base64',
    );
    return `0${getChash160(devicePubKey)}`;
  });

export const selectDevicePrivKey = () =>
  createSelector(selectDeviceWif(), wif => {
    return fromWif(wif, testnet).privateKey;
  });

export const selectDevicePubKey = () =>
  createSelector(selectDevicePrivKey(), privKey => {
    return publicKeyCreate(Buffer.from(privKey), true).toString('base64');
  });

export const selectPermanentDeviceKeyObj = () =>
  createSelector(
    selectDevicePrivKey(),
    (priv) => ({
      priv,
      pubB64: publicKeyCreate(Buffer.from(priv), true).toString('base64')
    })
  );

export const selectDeviceTempKeyData = () =>
  createSelector(getDeviceState, state => {
    return {
      ...state.deviceTempKeys,
      pubB64: publicKeyCreate(
        Buffer.from(state.deviceTempKeys.privKey),
        true,
      ).toString('base64'),
      prevPubB64: publicKeyCreate(
        Buffer.from(state.deviceTempKeys.prevPrivKey),
        true,
      ).toString('base64'),
    };
  });
