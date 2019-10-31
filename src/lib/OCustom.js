import _ from 'lodash';
import Crypto from 'crypto';
import obyte from 'obyte';
import { common } from './../constants';


export const testnet = common.network === 'testnet';

export const hubAddress = common.network === 'testnet'
  ? 'obyte.org/bb-test'
  : 'obyte.org/bb';

export const oClient = common.network === 'testnet'
  ? new obyte.Client('wss://obyte.org/bb-test', { testnet })
  : new obyte.Client('wss://obyte.org/bb');

export const urlHost = common.network === 'testnet'
  ? 'obyte-tn:'
  : 'obyte:';

export const getDeviceMessageHashToSign = (objDeviceMessage) => {
  var objNakedDeviceMessage = _.clone(objDeviceMessage);
  delete objNakedDeviceMessage.signature;
  cleanNullsDeep(objNakedDeviceMessage); // device messages have free format and we can't guarantee absence of malicious fields
  return Crypto.createHash('sha256').update(getSourceString(objNakedDeviceMessage), 'utf8').digest();
}

function getSourceString(obj) {
  var arrComponents = [];
  function extractComponents(variable) {
    if (variable === null)
      throw Error("null value in " + JSON.stringify(obj));
    switch (typeof variable) {
      case "string":
        arrComponents.push("s", variable);
        break;
      case "number":
        arrComponents.push("n", variable.toString());
        break;
      case "boolean":
        arrComponents.push("b", variable.toString());
        break;
      case "object":
        if (Array.isArray(variable)) {
          if (variable.length === 0)
            throw Error("empty array in " + JSON.stringify(obj));
          arrComponents.push('[');
          for (var i = 0; i < variable.length; i++)
            extractComponents(variable[i]);
          arrComponents.push(']');
        }
        else {
          var keys = Object.keys(variable).sort();
          if (keys.length === 0)
            throw Error("empty object in " + JSON.stringify(obj));
          keys.forEach(function (key) {
            if (typeof variable[key] === "undefined")
              throw Error("undefined at " + key + " of " + JSON.stringify(obj));
            arrComponents.push(key);
            extractComponents(variable[key]);
          });
        }
        break;
      default:
        throw Error("getSourceString: unknown type=" + (typeof variable) + " of " + variable + ", object: " + JSON.stringify(obj));
    }
  }

  extractComponents(obj);
  return arrComponents.join("\x00");
}

export const cleanNullsDeep = (obj) => {
  Object.keys(obj).forEach(function (key) {
    if (obj[key] === null)
      delete obj[key];
    else if (typeof obj[key] === 'object')
      cleanNullsDeep(obj[key]);
  });
}