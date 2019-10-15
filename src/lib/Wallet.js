import { common } from './../constants';
import Mnemonic from 'bitcore-mnemonic';
import obyte from 'obyte';
import { toWif, getChash160 } from 'obyte/lib/utils';


export const oClient = common.network === 'testnet'
  ? new obyte.Client('wss://obyte.org/bb-test', { testnet })
  : new obyte.Client('wss://obyte.org/bb');

/**
 * Creates new wallet address including path, keys, wif, seedwords
 * @returns {object}
 */
export const createWallet = () => {
  const testnet = common.network === 'testnet';
  let mnemonic = new Mnemonic();
  while (!Mnemonic.isValid(mnemonic.toString())) {
    mnemonic = new Mnemonic();
  }
  const path = testnet ? "m/44'/1'/0'/0/0" : "m/44'/0'/0'/0/0";
  const xPrivKey = mnemonic.toHDPrivateKey('');
  const { privateKey } = xPrivKey.derive(path);
  const privKeyBuf = privateKey.bn.toBuffer({ size: 32 });
  const wif = toWif(privKeyBuf, testnet);
  const publicKey = privateKey.publicKey.toBuffer().toString('base64');
  const address = getChash160(['sig', { publicKey }]);

  return {
    path,
    publicKey,
    address,
    wif,
    privateKey: xPrivKey.toString(),
    seedWords: mnemonic.phrase,
  };
}

/**
 * Converts bytes to other sizes
 * @param {int} value - in bytes (b)
 * @param {string} output - B | kB | MB | GB
 * @returns {int}
 */
export const formatBytes = (value = 0, output = 'B') => {
  switch(output) {
    case 'kB':
      return value / 1000;
    
    case 'MB':
      return value / 1000000;

    case 'GB':
      return value / 1000000000;

    default:
      return value;
  }
}

export const bytesToDollars = (bytes, rate) => {
  const GB = bytes / 1000000000;
  const dollars = (GB * rate).toFixed(2);
  return dollars;
}