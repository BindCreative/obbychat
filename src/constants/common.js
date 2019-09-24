let Common = {};

Common.network = 'testnet';

Common.DERIVATION_STRATEGIES = {
  BIP44: 'BIP44',
  BIP48: 'BIP48',
};

Common.UNITS = {
  byte: {
    value: 1,
    maxDecimals: 0,
    minDecimals: 0,
  },
  kilo: {
    value: 1000,
    maxDecimals: 0,
    minDecimals: 0,
  },
  mega: {
    value: 1000000,
    maxDecimals: 0,
    minDecimals: 0,
  },
  giga: {
    value: 1000000000,
    maxDecimals: 0,
    minDecimals: 0,
  }
};

export default Common;