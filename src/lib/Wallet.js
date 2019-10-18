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
 * @param {int} n - in bytes (B)
 * @param {string} unit - kB | MB | GB
 * @returns {int}
 */
export const bytesToUnit = (n, unit) => {
  switch (unit) {
    case 'B':
      return n;
    case 'kB':
      return n / 1000;
    case 'MB':
      return n / 1000000;
    case 'GB':
      return n / 1000000000;
    default:
      return false;
  }
}

/**
 * Converts unit to bytes
 * @param {int} n - in bytes (b)
 * @param {string} unit - kB | MB | GB
 * @returns {int}
 */
export const unitToBytes = (n, unit) => {
  switch (unit) {
    case 'GB':
      return n * 1000000000;
    case 'MB':
      return n * 1000000;
    case 'kB':
      return n * 1000;
    case 'B':
      return n;
    default:
      return false;
  }
}

export const availableUnits = [
  { label: 'bytes', value: 'B', altValue: 'BYTE' },
  { label: 'kB', value: 'kB', altValue: 'kBYTE' },
  { label: 'MB', value: 'MB', altValue: 'MBYTE' },
  { label: 'GB', value: 'GB', altValue: 'GBYTE' },
];