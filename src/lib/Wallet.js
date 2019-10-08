import { common } from '../constants';
import Mnemonic from 'bitcore-mnemonic';
import objectHash from 'ocore/object_hash';
import wifLib from 'wif';

export const generateSeed = () => { }

export const createWallet = opts => {
  const version = common.network === 'testnet' ? 239 : 128;
  let mnemonic = new Mnemonic();
  while (!Mnemonic.isValid(mnemonic.toString())) {
    mnemonic = new Mnemonic();
  }
  const path = common.network === 'testnet' ? "m/44'/1'/0'/0/0" : "m/44'/0'/0'/0/0";
  const xPrivKey = mnemonic.toHDPrivateKey('');
  const { privateKey } = xPrivKey.derive(path);
  const privKeyBuf = privateKey.bn.toBuffer({ size: 32 });
  const wif = wifLib.encode(version, privKeyBuf, false);
  const publicKey = privateKey.publicKey.toBuffer().toString('base64');
  const address = objectHash.getChash160(['sig', { publicKey }]);

  return {
    path,
    publicKey,
    address,
    wif,
    privateKey: xPrivKey.toString(),
    seedWords: mnemonic.phrase,
  };
}

export const recreateWallet = () => { }

export const getBalance = () => { }

export const getTransactionHistory = () => { }