import { common } from './../constants';
import obyte from 'obyte';


export const testnet = common.network === 'testnet';

export const oClient = common.network === 'testnet'
  ? new obyte.Client('wss://obyte.org/bb-test', { testnet })
  : new obyte.Client('wss://obyte.org/bb');

/**
 * Converts bytes to other sizes
 * @param {int} n - in bytes (B)
 * @param {string} unit - kB | MB | GB
 * @returns {int}
 */
export const bytesToUnit = (n, unit) => {
  switch (unit) {
    case 'BYTE':
    case 'B':
      return Number(n);
    case 'kBYTE':
    case 'kB':
      return n / 1000;
    case 'MBYTE':
    case 'MB':
      return n / 1000000;
    case 'GBYTE':
    case 'GB':
      return n / 1000000000;
    default:
      return Number(n);
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
    case 'GBYTE':
    case 'GB':
      return n * 1000000000;
    case 'MBYTE':
    case 'MB':
      return n * 1000000;
    case 'kBYTE':
    case 'kB':
      return n * 1000;
    case 'BYTE':
    case 'B':
      return Number(n);
    default:
      return Number(n);
  }
}

export const availableUnits = [
  { label: 'bytes', value: 'B', altValue: 'BYTE' },
  { label: 'kB', value: 'kB', altValue: 'kBYTE' },
  { label: 'MB', value: 'MB', altValue: 'MBYTE' },
  { label: 'GB', value: 'GB', altValue: 'GBYTE' },
];