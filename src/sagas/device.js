import {
  take,
  takeEvery,
  call,
  put,
  select,
  all,
  delay,
} from '@redux-saga/core/effects';
import { channel } from '@redux-saga/core';
import { validateSignedMessage } from 'obyte/lib/utils';
import DeviceInfo from 'react-native-device-info';
import * as Crypto from 'react-native-crypto';
import uuid from 'uuid/v4';
import NetInfo from "@react-native-community/netinfo";
import { AppState } from'react-native';

import NavigationService from './../navigation/service';
import { actionTypes } from '../constants';
import { REGEX_SIGNED_MESSAGE, REGEX_PAIRING } from './../lib/messaging';
import {
  sign,
  oClient,
  hubAddress,
  decryptPackage,
  getBase64Hash,
  getTempPubKey,
  createEncryptedPackage,
  getDeviceMessageHashToSign,
  deliverMessage,
  getSignedMessageInfoFromJsonBase64,
  getDeviceAddress,
} from './../lib/oCustom';
import { setToastMessage } from './../actions/app';
import { updateWalletData } from "../actions/balances";
import {
  addCorrespondent,
  removeCorrespondent,
  correspondentRemovedDevice,
  updateCorrespondentWalletAddress,
  setCorrespondentName,
  addCorrespondentFail
} from '../actions/correspondents';
import {
  addMessageSuccess,
  addMessageTemp,
  addMessageFail,
  receiveMessageStart,
  receiveMessageSuccess,
  receiveMessageFail,
  setUnreadMessages,
} from '../actions/messages';
import { setExchangeRates } from './../actions/exchangeRates';
import {
  selectCorrespondentByPairingSecret,
  selectCorrespondent,
} from './../selectors/messages';
import {
  selectDeviceAddress,
  selectPermanentDeviceKeyObj,
  selectDeviceTempKeyData,
} from './../selectors/device';
import { selectWalletAddress } from "../selectors/wallet";

let heartBeatInterval = 0;

let oChannel;

if (!oChannel) {
  oChannel = channel();
}

const deviceInfo = {};

export function* initDeviceInfo() {
  deviceInfo.deviceAddress = yield select(selectDeviceAddress());
  deviceInfo.permanentDeviceKeyObj = yield select(selectPermanentDeviceKeyObj());
  deviceInfo.deviceTempKeyData = yield select(selectDeviceTempKeyData());
}

export function* loginToHub(challenge) {
  const permanentDeviceKey = deviceInfo.permanentDeviceKeyObj;
  const tempDeviceKeyData = deviceInfo.deviceTempKeyData;

  const objLogin = { challenge, pubkey: permanentDeviceKey.pubB64 };
  objLogin.signature = sign(
    getDeviceMessageHashToSign(objLogin),
    permanentDeviceKey.priv,
  );
  oClient.justsaying('hub/login', objLogin);

  const objTempPubkey = {
    temp_pubkey: tempDeviceKeyData.pubB64,
    pubkey: permanentDeviceKey.pubB64,
  };

  objTempPubkey.signature = sign(
    getDeviceMessageHashToSign(objTempPubkey),
    permanentDeviceKey.priv,
  );

  yield oClient.api.tempPubkey(objTempPubkey);

  oClient.justsaying('hub/refresh', null);
}

export function stopSubscribeToHub() {
  oClient.client.ws.close();
  clearInterval(heartBeatInterval);
}

function* resubscribeToHub() {
  yield call(subscribeToHub);
  yield put(updateWalletData());
}

export function* subscribeToHub() {
  try {
    const walletAddress = yield select(selectWalletAddress());
    oClient.client.connect();
    oClient.client.onConnectCallback = () => {
      oClient.subscribe((err, result) => {
        if (err) {
          throw new Error('Hub socket error');
        } else {
          const [type, payload] = result;
          console.log(type, payload.subject);
          oChannel.put({ type, payload });
        }
      });
      heartBeatInterval = setInterval(() => {
        oClient.api.heartbeat();
      }, 10000);
      oClient.justsaying('light/new_address_to_watch', walletAddress);
      oClient.client.ws.addEventListener('close', () => {
        NetInfo.fetch().then(({ isConnected }) => {
          if (isConnected && AppState.currentState !== 'background') {
            call(resubscribeToHub)
          }
        });
      })
    };
  } catch (error) {
    yield put(
      setToastMessage({
        type: 'ERROR',
        message: 'Hub connection error',
      }),
    );
  }
}

export function* watchHubMessages() {
  while (true) {
    try {
      const {type, payload} = yield take(oChannel);
      if (type === 'justsaying') {
        if (payload.subject === 'hub/challenge' && !!payload.body) {
          yield call(loginToHub, payload.body);
        } else if (payload.subject === 'hub/message') {
          yield call(receiveMessage, payload);
        } else if (payload.subject === 'exchange_rates') {
          yield put(setExchangeRates(payload.body));
        } else if (payload.subject === 'info' && /^(\d+) messages? sent$/.test(payload?.body)) {
          yield put(
            setUnreadMessages(
              parseInt(/^(\d+) messages? sent$/.exec(payload.body)[1]),
            ),
          );
        } else if (payload.subject === 'light/have_updates' || payload.subject === 'joint') {
          yield put(updateWalletData());
        }
      } else if (type === 'request') {
        console.log('UNHANDLED REQUEST FROM HUB: ', payload);
      } else {
        console.log('UNHANDLED PACKAGE FROM HUB: ', type, payload);
      }
    } catch (error) {
      console.log('UNHANDLED HUB MESSAGE ERROR', error);
    }
  }
}

export function* receiveMessage({ body }) {
  const tempDeviceKey = deviceInfo.deviceTempKeyData;
  const permDeviceKey = deviceInfo.permanentDeviceKeyObj;

  try {
    const decryptedMessage = yield call(
      decryptPackage,
      body.message.encrypted_package,
      permDeviceKey,
      tempDeviceKey,
    );

    if (decryptedMessage.subject === 'removed_paired_device') {
      yield put(correspondentRemovedDevice({ address: decryptedMessage.from }));
    } else if (decryptedMessage.subject === 'pairing') {
      console.log('Pairing');
      const existingCorrespondent = yield select(
        selectCorrespondentByPairingSecret(
          decryptedMessage.body.pairing_secret,
        ),
      );
      const reversePairingSecret =
        decryptedMessage.body?.reverse_pairing_secret;
      console.log('checks', existingCorrespondent, reversePairingSecret);
      if (!reversePairingSecret && !existingCorrespondent) {
        console.log('Correspondent started adding you');
        // Correspondent started adding you
        const correspondent = {
          address: decryptedMessage.from,
          name: decryptedMessage.body.device_name,
          hub: decryptedMessage.device_hub,
          pubKey: body.message.pubkey,
          pairingSecret: decryptedMessage.body.pairing_secret,
        };
        const pairedCorrespondent = yield select(selectCorrespondent(decryptedMessage.from));
        yield put(addCorrespondent(correspondent));
        NavigationService.navigate('Chat', {
          correspondent: {
            ...pairedCorrespondent,
            ...correspondent
          }
        });
        yield call(sendPairingMessage, {
          reversePairingSecret,
          hub: correspondent.hub,
          address: correspondent.address,
          pairingSecret: correspondent.pairingSecret,
          recipientPubKey: body.message.pubkey,
        });
      } else if (!existingCorrespondent && reversePairingSecret) {
        console.log('I send pairing confirmation');
        // I send pairing confirmation
        const correspondent = {
          address: decryptedMessage.from,
          name: decryptedMessage.body.device_name,
          hub: decryptedMessage.device_hub,
          pubKey: body.message.pubkey,
          pairingSecret: decryptedMessage.body.pairing_secret,
          reversePairingSecret,
        };
        const pairedCorrespondent = yield select(selectCorrespondent(decryptedMessage.from));
        yield put(addCorrespondent(correspondent));
        NavigationService.navigate('Chat', {
          correspondent: {
            ...pairedCorrespondent,
            ...correspondent
          }
        });
        yield call(sendPairingMessage, {
          reversePairingSecret,
          hub: correspondent.hub,
          address: correspondent.address,
          pairingSecret: reversePairingSecret,
          recipientPubKey: body.message.pubkey,
        });
      } else if (
        !reversePairingSecret &&
        existingCorrespondent?.reversePairingSecret ===
          decryptedMessage.body.pairing_secret
      ) {
        console.log('Correspondent sends pairing confirmation');
        // Correspondent sends pairing confirmation
        yield put(
          setCorrespondentName({
            address: decryptedMessage.from,
            name: decryptedMessage.body.device_name ?? 'New',
          }),
        );
      }
      const correspondent = yield select(
        selectCorrespondent(decryptedMessage.from),
      );
      if (!correspondent) {
        console.error("Can't finish pairing, correspondent not stored");
      }
    } else if (decryptedMessage.subject === 'text') {
      const endSpace = /\s$/;
      decryptedMessage.body = decryptedMessage.body.replace(endSpace, '');
      // Check if signed message with wallet address info
      yield call(checkForSigning, decryptedMessage, body);
      // Persist the message
      yield put(
        receiveMessageStart({
          address: decryptedMessage.from,
          messageType: decryptedMessage.subject,
          message: decryptedMessage.body,
          messageHash: body.message_hash,
          handleAs: 'RECEIVED',
          hub: decryptedMessage.device_hub,
          timestamp: Date.now(),
        }),
      );
    } else if (decryptedMessage.subject === 'payment_notification') {
      console.log('Payment notification', decryptedMessage);
      // const { joint } = yield call(oClient.api.getJoint, decryptedMessage.body);
      // const { unit } = joint;
      // console.log(unit);
    }
  } catch (error) {
    console.log('MESSAGE PARSING ERROR:', {
      error,
      message: body.message,
    });
  }
  oClient.justsaying('hub/delete', body.message_hash);
}

export function* sendMessage(action) {
  const id = yield call(uuid);
  try {
    yield put(addMessageTemp({ ...action.payload, id, timestamp: Date.now() }));
    const myPermKeys = deviceInfo.permanentDeviceKeyObj;
    const myDeviceAddress = deviceInfo.deviceAddress;
    const {
      pubKey: recipientPubKey,
      address: recipientAddress,
      message,
      isConnected
    } = action.payload;

    const packageObj = {
      from: myDeviceAddress,
      device_hub: hubAddress,
      subject: 'text',
      body: message,
    };

    const encryptedPackage = createEncryptedPackage(
      packageObj,
      recipientPubKey,
    );

    const deviceMessage = {
      encrypted_package: encryptedPackage,
    };

    const messageHash = getBase64Hash(deviceMessage);

    const messageData = {
      id,
      message,
      messageHash,
      address: recipientAddress,
      messageType: 'text'
    };
    if (isConnected) {
      messageData.timestamp = Date.now();
      const tempPubKeyData = yield getTempPubKey(recipientPubKey);
      const objEncryptedPackage = createEncryptedPackage(
        packageObj,
        tempPubKeyData.temp_pubkey,
      );
      const objDeviceMessage = {
        encrypted_package: objEncryptedPackage,
        to: recipientAddress,
        pubkey: myPermKeys.pubB64,
      };
      objDeviceMessage.signature = sign(
        getDeviceMessageHashToSign(objDeviceMessage),
        myPermKeys.priv,
      );
      yield call(deliverMessage, objDeviceMessage);
    } else {
      messageData.sendingError = true;
    }
    yield put(
      addMessageSuccess(messageData),
    );
  } catch (error) {
    yield put(addMessageFail({ id, address: action.payload.address }));
    console.log('UNHANDLED ERROR: ', error);
  }
}

// Persists incoming chat messages to store
export function* handleReceivedMessage(action) {
  try {
    const id = yield call(uuid);
    yield put(receiveMessageSuccess({ id, ...action.payload }));
    oClient.justsaying('hub/delete', action.payload.messageHash);
  } catch (error) {
    yield put(receiveMessageFail());
  }
}

export function* acceptInvitation(action) {
  try {
    const { data } = action.payload;
    let cDeviceAddress, cPubKey, cHub, pairingSecret;

    if (typeof data === 'string') {
      data.replace(
        REGEX_PAIRING,
        (
          str,
          protocol,
          correspondentPubKey,
          correspondentHub,
          correspondentPairingSecret,
        ) => {
          cDeviceAddress = getDeviceAddress(correspondentPubKey);
          cPubKey = correspondentPubKey;
          cHub = correspondentHub;
          pairingSecret = correspondentPairingSecret;
        },
      );
    } else {
      const { pubkey, hub, pairing_secret } = data;
      cDeviceAddress = getDeviceAddress(pubkey);
      cPubKey = pubkey;
      cHub = hub;
      pairingSecret = pairing_secret;
    }

    if (cDeviceAddress) {
      const reversePairingSecret = Crypto.randomBytes(9).toString('base64');

      yield call(sendPairingMessage, {
        pairingSecret,
        reversePairingSecret,
        address: cDeviceAddress,
        recipientPubKey: cPubKey,
        hub: cHub,
      });
      yield put(
        addCorrespondent({
          hub: cHub,
          pubKey: cPubKey,
          pairingSecret,
          reversePairingSecret,
          address: cDeviceAddress,
          name: 'New',
        }),
      );
      yield call(NavigationService.navigate, 'ChatStack');
    } else {
      yield call(NavigationService.navigate, 'ChatStack');
      yield put(addCorrespondentFail());
      yield put(
        setToastMessage({
          type: 'ERROR',
          message: 'Unable to accept invitation',
        }),
      );
    }
  } catch(e) {
    yield call(NavigationService.navigate, 'ChatStack');
    yield put(addCorrespondentFail());
    yield put(
      setToastMessage({
        type: 'ERROR',
        message: 'Unable to accept invitation',
      })
    );
  }
}

export function* checkForSigning(decryptedMessage) {
  let info;

  decryptedMessage.body.replace(
    REGEX_SIGNED_MESSAGE,
    (str, description, signedMessageBase64) => {
      info = getSignedMessageInfoFromJsonBase64(signedMessageBase64);
  });

  if (info && info.valid) {
    yield put(
      updateCorrespondentWalletAddress({
        address: decryptedMessage.from,
        walletAddress: info.objSignedMessage.authors[0].address ?? null
      })
    );
  }
}

export function* sendPairingMessage({
  hub,
  address,
  pairingSecret,
  reversePairingSecret,
  recipientPubKey,
}) {
  try {
    const myPermKeys = deviceInfo.permanentDeviceKeyObj;
    const myDeviceAddress = deviceInfo.deviceAddress;
    const myDeviceName = yield call(DeviceInfo.getDeviceName);
    let body = { pairing_secret: pairingSecret, device_name: myDeviceName };
    if (reversePairingSecret) {
      body.reverse_pairing_secret = reversePairingSecret;
    }

    const packageObj = {
      from: myDeviceAddress,
      device_hub: hub,
      subject: 'pairing',
      body: body,
    };

    // const encryptedPackage = createEncryptedPackage(
    //   packageObj,
    //   recipientPubKey,
    // );
    const tempPubKeyData = yield getTempPubKey(recipientPubKey);
    const objEncryptedPackage = createEncryptedPackage(
      packageObj,
      tempPubKeyData.temp_pubkey,
    );
    const objDeviceMessage = {
      encrypted_package: objEncryptedPackage,
      to: address,
      pubkey: myPermKeys.pubB64,
    };
    objDeviceMessage.signature = sign(
      getDeviceMessageHashToSign(objDeviceMessage),
      myPermKeys.priv,
    );
    const res = yield deliverMessage(objDeviceMessage);
    console.log('sendPairingMessage: ', res);
  } catch (e) {
    console.log('sendPairingMessage failed', JSON.stringify(e));
    throw new Error(e);
  }
}

// Deprecated, as reconnect option was introduced to obyte.js
export function* removeCorrespondentSaga(action) {
  const correspondent = yield select(
    selectCorrespondent(action.payload.address),
  );
  const myPermKeys = deviceInfo.permanentDeviceKeyObj;
  const myDeviceAddress = deviceInfo.deviceAddress;

  const packageObj = {
    from: myDeviceAddress,
    device_hub: hubAddress,
    subject: 'removed_paired_device',
    body: 'removed',
  };

  const tempPubKeyData = yield getTempPubKey(correspondent.pubKey);

  const objEncryptedPackage = createEncryptedPackage(
    packageObj,
    tempPubKeyData.temp_pubkey,
  );
  const objDeviceMessage = {
    encrypted_package: objEncryptedPackage,
    to: action.payload.address,
    pubkey: myPermKeys.pubB64,
  };
  objDeviceMessage.signature = sign(
    getDeviceMessageHashToSign(objDeviceMessage),
    myPermKeys.priv,
  );
  yield deliverMessage(objDeviceMessage);
}

export default function* watch() {
  yield all([
    watchHubMessages(),
    takeEvery(actionTypes.INIT_DEVICE_INFO, initDeviceInfo),
    takeEvery(actionTypes.RESUBSCRIBE_TO_HUB, resubscribeToHub),
    takeEvery(actionTypes.MESSAGE_ADD_START, sendMessage),
    takeEvery(actionTypes.MESSAGE_RECEIVE_START, handleReceivedMessage),
    takeEvery(actionTypes.CORRESPONDENT_INVITATION_ACCEPT, acceptInvitation),
    takeEvery(actionTypes.CORRESPONDENT_DEVICE_REMOVE, removeCorrespondentSaga),
  ]);
}
