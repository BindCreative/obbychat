import { createSelector } from 'reselect';
import { testnet } from "../lib/oCustom";
import { fromWif, getChash160, toWif } from "obyte/lib/utils";
import { publicKeyCreate } from "secp256k1";

export const getTemporaryState = state => state.temporary;

export const selectInit = () =>
  createSelector(getTemporaryState, state => state.init);

export const selectWallet = () =>
  createSelector(getTemporaryState, state => {
    return state;
  });

export const selectDeviceWif = () =>
  createSelector(getTemporaryState, state => state.deviceWif);

export const selectDeviceAddress = () =>
  createSelector(selectDeviceWif(), (deviceWif) => {
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

export const selectPermanentDeviceKeyObj = () =>
  createSelector(
    selectDevicePrivKey(),
    (priv) => ({
      priv,
      pubB64: publicKeyCreate(Buffer.from(priv), true).toString('base64')
    })
  );

export const selectDevicePubKey = () =>
  createSelector(selectDevicePrivKey(), privKey => {
    return publicKeyCreate(Buffer.from(privKey), true).toString('base64');
  });

export const selectWalletAddress = () =>
  createSelector(getTemporaryState, state => state.address);

export const selectWalletWif = () =>
  createSelector(getTemporaryState, state => state.walletWif);

export const selectAddressWif = () =>
  createSelector(getTemporaryState, state => state.addressWif);

export const selectWitnesses = () =>
  createSelector(getTemporaryState, state => state.witnesses);

export const selectWalletInit = () =>
  createSelector(getTemporaryState, ({ walletInit }) => walletInit);

export const selectAccountInit = () =>
  createSelector(getTemporaryState, ({ accountInit }) => accountInit);

export const selectWalletInitAddress = () =>
  createSelector(getTemporaryState, ({ address }) => address);

export const selectConnectionStatus = () =>
  createSelector(getTemporaryState, ({ connectedToHub }) => connectedToHub);
