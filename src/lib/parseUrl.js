import * as validationUtils from './validationUtils';
import { common } from '../constants';

const parseQueryString = (str, delimiter) => {
  if (!delimiter) {
    delimiter = '&';
  }
  const arrPairs = str.split(delimiter);
  const assocParams = {};
  arrPairs.forEach(function(pair){
    const arrNameValue = pair.split('=');
    if (arrNameValue.length !== 2)
      return;
    const name = decodeURIComponent(arrNameValue[0]);
    assocParams[name] = decodeURIComponent(arrNameValue[1]);
  });
  return assocParams;
};

const parseUrl = (url, walletAddress) => {
  const protocol = common.network === "testnet" ? "obyte-tn" : "obyte";
  const re = new RegExp(`^${protocol}:(.+)$`, 'i');
  const arrMatches = url.match(re);

  if (!arrMatches) {
    if (url === `${protocol}:`) {
      return ({ type: common.urlTypes.emptyRun });
    } else {
      return ({
        type: common.urlTypes.error,
        message: `no ${protocol} prefix`
      });
    }
  } else {
    const value = arrMatches[1];
    const arrPairingMatches = value.replace('%23', '#').match(/^([\w\/+]{44})@([\w.:\/-]+)#(.+)$/);
    if (arrPairingMatches) {
      return ({
        type: common.urlTypes.pairing,
        pubkey: arrPairingMatches[1],
        hub: arrPairingMatches[2],
        pairing_secret: arrPairingMatches[3]
      });
    }

    const arrParts = value.split('?');
    if (arrParts.length > 2) {
      return ({
        type: common.urlTypes.error,
        message: "too many question marks"
      });
    }
    const address = decodeURIComponent(arrParts[0]);
    const query_string = arrParts[1];
    if (
      !validationUtils.isValidAddress(address)
      && !validationUtils.isValidEmail(address)
      && !address.match(/^(steem\/|reddit\/|github\/|bitcointalk\/|@).{3,}/i)
      && !address.match(/^\+\d{9,14}$/)
    ) {
      return ({
        type: common.urlTypes.error,
        message: `address ${address} is invalid`
      });
    } else {
      const urlParams = {
        type: common.urlTypes.payment,
        walletAddress: address,
        amount: 0
      };
      if (!query_string) {
        return urlParams;
      }
      const assocParams = parseQueryString(query_string);
      const strAmount = assocParams.amount;
      if (typeof strAmount === 'string') {
        const amount = parseInt(strAmount);
        if (amount + '' !== strAmount) {
          urlParams.type = common.urlTypes.error;
          urlParams.message = `invalid amount: ${strAmount}`;
          return urlParams;
        } else if (!validationUtils.isPositiveInteger(amount)) {
          urlParams.type = common.urlTypes.error;
          urlParams.message = `nonpositive amount: ${strAmount}`;
          return urlParams;
        }
        urlParams.amount = amount;
      }
      const asset = assocParams.asset;
      if (typeof asset === 'string'){
        if (asset !== 'base') {
          urlParams.type = common.urlTypes.error;
          urlParams.message = `invalid asset: ${asset}`;
          return urlParams;
        }
        urlParams.asset = asset;
      }
      // if (assocParams.device_address) {
      //   urlParams.type = common.urlTypes.error;
      //   urlParams.message = `unused parameter device_address`;
      //   return urlParams;
      // }
      if (assocParams.base64data) {
        urlParams.type = common.urlTypes.error;
        urlParams.message = `unused parameter base64data`;
        return urlParams;
      }
      const { from_address } = assocParams;
      if (from_address) {
        if (from_address !== walletAddress) {
          urlParams.type = common.urlTypes.error;
          urlParams.message = `wrong parameter from_address`;
          return urlParams;
        } else {
          urlParams.from_address = from_address;

        }
      }
      const { single_address } = assocParams;
      if (single_address) {
        if (single_address !== "1") {
          urlParams.type = common.urlTypes.error;
          urlParams.message = `invalid single_address: ${single_address}`;
          return urlParams;
        } else {
          urlParams.single_address = single_address;
        }
      }
      return urlParams;
    }
  }
};

export default parseUrl;
