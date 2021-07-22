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
    case 'KBYTE':
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
};

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
    case 'KBYTE':
    case 'KB':
      return n * 1000;
    case 'BYTE':
    case 'B':
      return Number(n);
    default:
      return Number(n);
  }
};

export const PRIMARY_UNITS = [
  { label: 'BYTES', value: 'B', altValue: 'BYTES' },
  { label: 'KBYTE', value: 'KB', altValue: 'KBYTE' },
  { label: 'MBYTE', value: 'MB', altValue: 'MBYTE' },
  { label: 'GBYTE', value: 'GB', altValue: 'GBYTE' },
];

export const SECONDARY_UNITS = [
  { label: 'USD', value: 'USD' },
  { label: 'BTC', value: 'BTC' },
];

export const getMaxDecimalsLength = (unit) => {
  switch (unit) {
    case 'BYTE':
    case 'B':
      return 0;
    case 'KBYTE':
    case 'KB':
      return 3;
    case 'MBYTE':
    case 'MB':
      return 6;
    case 'GBYTE':
    case 'GB':
      return 9;
    case 'USD':
      return 2;
    case 'BTC':
      return 8;
  }
};
