import _ from 'lodash';
import * as Crypto from 'react-native-crypto';
import obyte from 'obyte';
import { validateSignedMessage } from 'obyte/lib/utils';
import ecdsa from 'secp256k1';
import { getChash160 } from 'obyte/lib/utils';
import { common } from './../constants';

export const testnet = common.network === 'testnet';

export const hubAddress = common.network === 'testnet'
  // ? 'obyte.org/bb-test' : 'obyte.org/bb';
  ? 'testnethub.bytes.cash/bb-test' : 'obyte.org/bb';

export const clientParams = testnet ? { testnet, reconnect: false } : { reconnect: false };

export const oClient = new obyte.Client(`wss://${hubAddress}`, clientParams);

export const urlHost = common.network === 'testnet' ? 'obyte-tn:' : 'obyte:';

// Helpers
export const getDeviceAddress = b64PubKey => `0${getChash160(b64PubKey)}`;

export const getBase64Hash = (obj, bJsonBased) => {
  var sourceString = bJsonBased
    ? getJsonSourceString(obj)
    : getSourceString(obj);
  return Crypto.createHash('sha256')
    .update(sourceString, 'utf8')
    .digest('base64');
};

export const getDeviceMessageHashToSign = objDeviceMessage => {
  var objNakedDeviceMessage = _.clone(objDeviceMessage);
  delete objNakedDeviceMessage.signature;
  cleanNullsDeep(objNakedDeviceMessage); // device messages have free format and we can't guarantee absence of malicious fields
  return Crypto.createHash('sha256')
    .update(getSourceString(objNakedDeviceMessage), 'utf8')
    .digest();
};

export const getSourceString = obj => {
  var arrComponents = [];
  function extractComponents(variable) {
    if (variable === null) throw Error('null value in ' + JSON.stringify(obj));
    switch (typeof variable) {
      case 'string':
        arrComponents.push('s', variable);
        break;
      case 'number':
        arrComponents.push('n', variable.toString());
        break;
      case 'boolean':
        arrComponents.push('b', variable.toString());
        break;
      case 'object':
        if (Array.isArray(variable)) {
          if (variable.length === 0)
            throw Error('empty array in ' + JSON.stringify(obj));
          arrComponents.push('[');
          for (var i = 0; i < variable.length; i++)
            extractComponents(variable[i]);
          arrComponents.push(']');
        } else {
          var keys = Object.keys(variable).sort();
          if (keys.length === 0)
            throw Error('empty object in ' + JSON.stringify(obj));
          keys.forEach(function(key) {
            if (typeof variable[key] === 'undefined')
              throw Error('undefined at ' + key + ' of ' + JSON.stringify(obj));
            arrComponents.push(key);
            extractComponents(variable[key]);
          });
        }
        break;
      default:
        throw Error(
          'getSourceString: unknown type=' +
            typeof variable +
            ' of ' +
            variable +
            ', object: ' +
            JSON.stringify(obj),
        );
    }
  }

  extractComponents(obj);
  return arrComponents.join('\x00');
};

export const cleanNullsDeep = obj => {
  Object.keys(obj).forEach(function(key) {
    if (obj[key] === null) delete obj[key];
    else if (typeof obj[key] === 'object') cleanNullsDeep(obj[key]);
  });
};

export const deriveSharedSecret = (ecdh, peerB64Pubkey) => {
  const sharedSecretSrc = ecdh.computeSecret(peerB64Pubkey, 'base64');
  return Crypto.createHash('sha256')
    .update(sharedSecretSrc)
    .digest()
    .slice(0, 16);
};

export const sign = function(hash, privKey) {
  var res = ecdsa.sign(hash, privKey);
  return res.signature.toString('base64');
};

export const verify = function(hash, b64_sig, b64_pub_key) {
  try {
    var signature = new Buffer.from(b64_sig, 'base64'); // 64 bytes (32+32)
    return ecdsa.verify(
      hash,
      signature,
      new Buffer.from(b64_pub_key, 'base64'),
    );
  } catch (e) {
    return false;
  }
};

// Messaging
export const decryptPackage = (
  objEncryptedPackage,
  myPermDeviceKey,
  myTempDeviceKey,
) => {
  let privKey;

  if (
    typeof objEncryptedPackage.iv !== 'string' ||
    typeof objEncryptedPackage.authtag !== 'string' ||
    typeof objEncryptedPackage.encrypted_message !== 'string' ||
    !objEncryptedPackage.dh ||
    typeof objEncryptedPackage.dh !== 'object'
  )
    throw 'INVALID_PARAMS';
  if (
    objEncryptedPackage.dh.recipient_ephemeral_pubkey === myTempDeviceKey.pubB64
  ) {
    privKey = myTempDeviceKey.privKey;
  } else if (
    myTempDeviceKey.prevPrivKey &&
    objEncryptedPackage.dh.recipient_ephemeral_pubkey ===
      myTempDeviceKey.prevPubB64
  ) {
    privKey = myTempDeviceKey.prevPrivKey;
  } else if (
    objEncryptedPackage.dh.recipient_ephemeral_pubkey === myPermDeviceKey.pubB64
  ) {
    privKey = myPermDeviceKey.priv;
  } else {
    throw 'INVALID_DECRYPTION_KEY';
  }

  const ecdh = Crypto.createECDH('secp256k1');
  ecdh.generateKeys('base64', 'compressed');
  ecdh.setPrivateKey(privKey);
  const shared_secret = deriveSharedSecret(
    ecdh,
    objEncryptedPackage.dh.sender_ephemeral_pubkey,
  );
  const iv = new Buffer.from(objEncryptedPackage.iv, 'base64');
  const decipher = Crypto.createDecipheriv('aes-128-gcm', shared_secret, iv);
  const authtag = new Buffer.from(objEncryptedPackage.authtag, 'base64');
  decipher.setAuthTag(authtag);
  const enc_buf = Buffer.from(objEncryptedPackage.encrypted_message, 'base64');

  var arrChunks = [];
  var CHUNK_LENGTH = 4096;
  for (let offset = 0; offset < enc_buf.length; offset += CHUNK_LENGTH) {
    arrChunks.push(
      decipher.update(
        enc_buf.slice(offset, Math.min(offset + CHUNK_LENGTH, enc_buf.length)),
      ),
    );
  }
  const decrypted1 = Buffer.concat(arrChunks);
  let decrypted2 = undefined;
  arrChunks = null;
  try {
    decrypted2 = decipher.final();
  } catch (e) {
    throw 'FAILED_TO_DECRYPT';
  }

  var decrypted_message_buf = Buffer.concat([decrypted1, decrypted2]);
  var decrypted_message = decrypted_message_buf.toString('utf8');
  var json = JSON.parse(decrypted_message);
  if (json.encrypted_package) {
    return decryptPackage(
      json.encrypted_package,
      myPermDeviceKey,
      myTempDeviceKey,
    );
  } else return json;
};

export const createEncryptedPackage = (json, recipient_device_pubkey) => {
  var text = JSON.stringify(json);
  var ecdh = Crypto.createECDH('secp256k1');
  var sender_ephemeral_pubkey = ecdh.generateKeys('base64', 'compressed');
  var shared_secret = deriveSharedSecret(ecdh, recipient_device_pubkey); // Buffer
  // we could also derive iv from the unused bits of ecdh.computeSecret() and save some bandwidth
  var iv = Crypto.randomBytes(12); // 128 bits (16 bytes) total, we take 12 bytes for random iv and leave 4 bytes for the counter
  var cipher = Crypto.createCipheriv('aes-128-gcm', shared_secret, iv);
  // under browserify, encryption of long strings fails with Array buffer allocation errors, have to split the string into chunks
  var arrChunks = [];
  var CHUNK_LENGTH = 2003;
  for (var offset = 0; offset < text.length; offset += CHUNK_LENGTH) {
    arrChunks.push(
      cipher.update(
        text.slice(offset, Math.min(offset + CHUNK_LENGTH, text.length)),
        'utf8',
      ),
    );
  }
  arrChunks.push(cipher.final());
  var encrypted_message_buf = Buffer.concat(arrChunks);
  arrChunks = null;
  var encrypted_message = encrypted_message_buf.toString('base64');
  var authtag = cipher.getAuthTag();
  // this is visible and verifiable by the hub
  var encrypted_package = {
    encrypted_message: encrypted_message,
    iv: iv.toString('base64'),
    authtag: authtag.toString('base64'),
    dh: {
      sender_ephemeral_pubkey: sender_ephemeral_pubkey,
      recipient_ephemeral_pubkey: recipient_device_pubkey,
    },
  };
  return encrypted_package;
};

export const getTempPubKey = async (recipientPubKey, client = oClient) => {
  let pubKeyResult;
  await client.api.getTempPubkey(recipientPubKey, (err, response) => {
    if (err) {
      throw new Error(`getTempPubKey error: ${err}`);
    } else if (
      !response.temp_pubkey ||
      !response.pubkey ||
      !response.signature
    ) {
      throw new Error('missing fields in hub response');
    } else if (response.pubkey !== recipientPubKey) {
      throw new Error('temp pubkey signed by wrong permanent pubkey');
    } else if (
      !verify(
        getDeviceMessageHashToSign(response),
        response.signature,
        response.pubkey,
      )
    ) {
      throw new Error('wrong sig under temp pubkey');
    }

    pubKeyResult = response;
  });

  return pubKeyResult;
};

export const deliverMessage = async (objDeviceMessage, client = oClient) => {
  try {
    let accepted = false;
    await client.api.deliver(objDeviceMessage, (error, response) => {
      if (error || response !== 'accepted') {
        throw new Error('unhandled error' + JSON.stringify(error));
      }
      accepted = true;
    });
    return accepted;
  } catch (e) {
    console.log(e);
  }
};

export const getSignedMessageInfoFromJsonBase64 = signedMessageBase64 => {
  const signedMessageJson = Buffer.from(signedMessageBase64, 'base64').toString('utf8');
  try {
    var objSignedMessage = JSON.parse(signedMessageJson);
  } catch (e) {
    return null;
  }
  return {
    objSignedMessage: objSignedMessage,
    valid: validateSignedMessage(objSignedMessage)
  };
};

export const parseQueryString = (query) => {
  const vars = query.split('&');
  const parameters = {};
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=');
    const name = decodeURIComponent(pair[0]);
    parameters[name] = decodeURIComponent(pair[1]);
  }
  return parameters;
};
