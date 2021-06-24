import { take, takeEvery, call, put, select, all } from '@redux-saga/core/effects';
import { channel } from '@redux-saga/core';
import DeviceInfo from 'react-native-device-info';
import * as Crypto from 'react-native-crypto';
import uuid from 'uuid/v4';
import NetInfo from "@react-native-community/netinfo";
import { AppState, Alert, Platform } from 'react-native';

import NavigationService from './../navigation/service';
import { actionTypes } from '../constants';
import { REGEX_SIGNED_MESSAGE, REGEX_PAIRING, REGEXP_QR_REQUEST_PAYMENT } from './../lib/messaging';

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

import { setConnectionStatus, setNotificationsEnabling, enableNotificationsRequest } from "../actions/device";
import { setToastMessage } from './../actions/app';
import { updateWalletData } from "../actions/balances";
import {
  addCorrespondent,
  correspondentRemovedDevice,
  updateCorrespondentWalletAddress,
  setCorrespondentName,
  addCorrespondentFail,
  acceptInvitation
} from '../actions/correspondents';
import {
  addMessageSuccess,
  addMessageTemp,
  addMessageFail,
  receiveMessageStart,
  receiveMessageSuccess,
  receiveMessageFail,
  setUnreadMessages,
  botPairSuccess
} from '../actions/messages';
import { setExchangeRates } from './../actions/exchangeRates';
import { openPaymentLink } from "../actions/wallet";

import {
  selectCorrespondentByPairingSecret,
  selectCorrespondent,
  selectDeviceTempKeyData,
  selectTransactionByUnitId,
  selectNotificationsEnabled
} from "../selectors/main";
import {
  selectDeviceAddress,
  selectPermanentDeviceKeyObj,
  selectWalletAddress,
  selectFcmToken
} from "../selectors/temporary";

import { requestNotificationsPermission } from "../screens/Container";


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

function* handleSetConnectionStatus(status) {
  yield put(setConnectionStatus(status))
}

function* stopSubscribeToHub() {
  oClient.client.ws.close();
  clearInterval(heartBeatInterval);
  yield put(setConnectionStatus(false));
}

function* resubscribeToHub() {
  yield call(subscribeToHub);
  yield put(updateWalletData());
}

export function* subscribeToHub() {
  try {
    const walletAddress = yield select(selectWalletAddress());
    const fetchConnection = new Promise((resolve) => {
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
        });
        resolve(true);
      };
    });
    const connected = yield fetchConnection;
    yield put(setConnectionStatus(connected));
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
    } else if (decryptedMessage.subject === 'text' || decryptedMessage.subject === 'payment_notification') {
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
      isConnected,
      messageType = "text"
    } = action.payload;

    const packageObj = {
      from: myDeviceAddress,
      device_hub: hubAddress,
      subject: messageType,
      body: message
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
      messageType
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

export function* acceptInvitationSaga(action) {
  try {
    const { data, botId } = action.payload;
    let cDeviceAddress, cPubKey, cHub, pairingSecret;

    if (typeof data === 'string') {
      data.replace(
        REGEX_PAIRING,
        (
          str,
          pairingCode,
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
      if (botId) {
        yield call(botPairSuccess(botId))
      }
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
    console.log('sendPairingMessage failed', e.toString());
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

export function* openPaymentFromChat(action) {
  const unitId = action.payload;
  const transaction = yield select(selectTransactionByUnitId(unitId));
  NavigationService.navigate('TransactionInfo', { transaction })
}

export function* openLink(action) {
  const { link } = action.payload;
  const decodedLink = decodeURIComponent(link);
  const linkParams = { type: "unsupported" };
  decodedLink
    .replace(REGEX_PAIRING, () => {
      linkParams.type = 'pairing';
      linkParams.data = decodedLink;
    })
    .replace(REGEXP_QR_REQUEST_PAYMENT, (str, payload, walletAddress) => {
      linkParams.type = 'payment';
      const query = link.split("?")[1];
      linkParams.data = { walletAddress, query };
    });

  const { type, data } = linkParams;

  switch (type) {
    case 'pairing': {
      yield put(acceptInvitation({ data }));
      return;
    }
    case 'payment': {
      NavigationService.popToTop();
      yield put(openPaymentLink(data));
      return;
    }
    default: {
      NavigationService.popToTop();
      yield put(setToastMessage({ type: 'ERROR', message: 'Unsupported link' }));
      return;
    }
  }
}

export function* initNotificationsRequest() {
  const notificationEnabled = yield select(selectNotificationsEnabled());
  const fcmToken = yield select(selectFcmToken());
  if (notificationEnabled === null) {
    if (!fcmToken) {
      yield put(setNotificationsEnabling(false));
    } else {
      yield put(enableNotificationsRequest());
    }
  }
}

export function* enableNotifications() {
  try {
    const registrationId = yield select(selectFcmToken());
    const enablePromise = new Promise((resolve, reject) => {
      oClient.client.request(
        'hub/enable_notification',
        { registrationId, platform: Platform.OS },
        (request, response) => {
          if (!response || (response && response !== 'ok')) {
            reject(false);
          } else {
            resolve(true);
          }
        })
    });
    const enabled = yield enablePromise;
    yield put(setNotificationsEnabling(enabled));
  } catch (e) {
    console.log(e)
  }
}

export function* disableNotifications() {
  try {
    const registrationId = yield select(selectFcmToken());
    const disablePromise = new Promise((resolve, reject) => {
      oClient.client.request(
        'hub/disable_notification',
        registrationId,
        (request, response) => {
          if (!response || (response && response !== 'ok')) {
            reject(true);
          } else {
            resolve(false);
          }
        })
    });
    const enabled = yield disablePromise;
    yield put(setNotificationsEnabling(enabled));
  } catch (e) {
    console.log(e)
  }
}

export default function* watch() {
  yield all([
    watchHubMessages(),
    takeEvery(actionTypes.INIT_DEVICE_INFO, initDeviceInfo),
    takeEvery(actionTypes.RESUBSCRIBE_TO_HUB, resubscribeToHub),
    takeEvery(actionTypes.STOP_SUBSCRIBE_TO_HUB, stopSubscribeToHub),
    takeEvery(actionTypes.MESSAGE_ADD_START, sendMessage),
    takeEvery(actionTypes.MESSAGE_RECEIVE_START, handleReceivedMessage),
    takeEvery(actionTypes.CORRESPONDENT_INVITATION_ACCEPT, acceptInvitationSaga),
    takeEvery(actionTypes.CORRESPONDENT_DEVICE_REMOVE, removeCorrespondentSaga),
    takeEvery(actionTypes.OPEN_PAYMENT_FROM_CHAT, openPaymentFromChat),
    takeEvery(actionTypes.OPEN_LINK, openLink),
    takeEvery(actionTypes.INIT_NOTIFICATIONS, initNotificationsRequest),
    takeEvery(actionTypes.ENABLE_NOTIFICATIONS, enableNotifications),
    takeEvery(actionTypes.DISABLE_NOTIFICATIONS, disableNotifications)
  ]);
}
