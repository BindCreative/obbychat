/**
 * Converts bytes to other sizes
 * @param {int} n - in bytes (B)
 * @param {string} unit - kB | MB | GB
 * @returns {int}
 */
export const bytesToUnit = (n, unit) => {
  const lowerUnit = unit.toLowerCase();
  switch (lowerUnit) {
    case 'kbyte':
    case 'kb':
      return n / 1000;
    case 'mbyte':
    case 'mb':
      return n / 1000000;
    case 'gbyte':
    case 'gb':
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
  const lowerUnit = unit.toLowerCase();
  switch (lowerUnit) {
    case 'gbyte':
    case 'gb':
      return n * 1000000000;
    case 'mbyte':
    case 'mb':
      return n * 1000000;
    case 'kbyte':
    case 'kb':
      return n * 1000;
    default:
      return Number(n);
  }
};

export const PRIMARY_UNITS = [
  { label: 'BYTES', value: 'B', altValue: 'BYTE' },
  { label: 'KBYTE', value: 'KB', altValue: 'kBYTE' },
  { label: 'MBYTE', value: 'MB', altValue: 'MBYTE' },
  { label: 'GBYTE', value: 'GB', altValue: 'GBYTE' },
];

export const SECONDARY_UNITS = [
  { label: 'USD', value: 'USD' },
  { label: 'BTC', value: 'BTC' },
];

export const getMaxDecimalsLength = (unit) => {
  const lowerUnit = unit.toLowerCase();
  switch (lowerUnit) {
    case 'kbyte':
    case 'kb':
      return 3;
    case 'mbyte':
    case 'mb':
      return 6;
    case 'gbyte':
    case 'gb':
      return 9;
    case 'usd':
      return 2;
    case 'btc':
      return 8;
    default:
      return 0;
  }
};

export const getUnitAltValue = (unit) => {
  let result = "BYTE";
  PRIMARY_UNITS.some(({ value, altValue, label }) => {
    if (value === unit || altValue === unit || label === unit) {
      result = altValue;
      return true;
    }
    return false;
  });
  return result;
};

export const getUnitLabel = (unit) => {
  let result = "BYTES";
  PRIMARY_UNITS.some(({ value, altValue, label }) => {
    if (value === unit || altValue === unit || label === unit) {
      result = label;
      return true;
    }
    return false;
  });
  return result;
};
