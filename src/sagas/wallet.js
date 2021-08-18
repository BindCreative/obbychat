import { takeLatest, take, call, put, select } from '@redux-saga/core/effects';
import Mnemonic from 'bitcore-mnemonic';
import { toWif, getChash160 } from 'obyte/lib/utils';
import { Alert } from 'react-native';
import * as Crypto from 'react-native-crypto';
import NetInfo from "@react-native-community/netinfo";
import NavigationService from './../navigation/service';
import { oClient, testnet, parseQueryString } from './../lib/oCustom';
import * as validationUtils from './../lib/validationUtils';
import { actionTypes } from './../constants';

import { subscribeToHub } from './device';

import { setToastMessage } from './../actions/app';
import {
  createInitialWalletStart,
  createInitialWalletSuccess,
  createInitialWalletFail,
  getWitnessesSuccess,
  initWalletFail,
  sendPaymentSuccess,
  sendPaymentFail,
  initAccountSuccess
} from './../actions/wallet';
import {
  loadWalletHistorySuccess,
  loadWalletHistoryFail,
} from '../actions/walletHistory';
import {
  loadWalletBalancesSuccess,
  loadWalletBalancesFail,
} from './../actions/balances';
import { initDeviceInfo, initDeviceSuccess, initNotificationsRequest } from "../actions/device";
import { botsAddSuccess, addMessageStart } from "../actions/messages";
import { setSeedWords, setPasswordProtected } from "../actions/secure";

import { selectSeedWords } from "../selectors/secure";
import { selectWalletAddress, selectWitnesses, selectAddressWif } from "../selectors/temporary";
import { selectMainReducer } from "../selectors/main";

const isEmpty = obj => Object.keys(obj).length === 1;

export function* init({ payload }) {
  try {
    yield call(checkExistWallets, payload);
    yield put(initDeviceInfo());
    // Handle websocket traffic
    yield call(subscribeToHub);
    yield put(initNotificationsRequest());
    // Fetch wallet data from hub
    yield call(fetchBalances);
    yield call(fetchWitnesses);
    yield call(initDefaultBots);
    yield call(fetchWalletHistory);
    yield put(initAccountSuccess());
  } catch (error) {
    console.log(error);
    yield put(initWalletFail());
    yield put(
      setToastMessage({
        type: 'ERROR',
        message: 'Unable to init wallet.',
      }),
    );
  }
}

export function* generateSeedWords() {
  let mnemonic = new Mnemonic();
  while (!Mnemonic.isValid(mnemonic.toString())) {
    mnemonic = new Mnemonic();
  }
  yield put(setSeedWords(mnemonic.phrase))
}

export function* checkExistWallets(payload) {
  const mainReducer = yield select(selectMainReducer());
  const seedWords = yield select(selectSeedWords());
  const { password } = payload;

  if (isEmpty(mainReducer)) {
    yield put(setPasswordProtected(!!password));
    yield put(createInitialWalletStart(payload));
  } else {
    let mnemonic = new Mnemonic(seedWords);
    const xPrivKey = mnemonic.toHDPrivateKey(password);

    const devicePath = "m/1";
    const { privateKey: devicePrivateKey } = yield xPrivKey.derive(devicePath);
    const devicePrivateKeyBuf = yield devicePrivateKey.bn.toBuffer({ size: 32 });
    const deviceWif = yield call(toWif, devicePrivateKeyBuf, testnet);
    const deviceWifSha = Crypto.createHash('sha256').update(deviceWif).digest("hex");
    if (mainReducer[deviceWifSha]) {
      yield put(createInitialWalletStart(payload));
    } else {
      const checkUserSelect = new Promise((resolve, reject) => {
        Alert.alert(
          'Warning',
          'Wallet with current password do not exist. Do you want to create a new one?',
          [
            {
              text: "Cancel",
              onPress: () => reject(false),
              style: "cancel"
            },
            {
              text: "OK",
              onPress: () => resolve(true)
            }
          ]
        )
      });

      const userSelect = yield checkUserSelect;
      if (userSelect) {
        yield put(createInitialWalletStart(payload));
      }
    }
  }
}

export function* createInitialWallet({ payload }) {
  try {
    const { password } = payload;
    const seedWords = yield select(selectSeedWords());
    const mainReducer = yield select(selectMainReducer());
    let mnemonic = new Mnemonic(seedWords);

    const xPrivKey = mnemonic.toHDPrivateKey(password);
    
    // DeviceWif
    const devicePath = "m/1";
    const { privateKey: devicePrivateKey } = yield xPrivKey.derive(devicePath);
    const devicePrivateKeyBuf = yield devicePrivateKey.bn.toBuffer({ size: 32 });
    const deviceWif = yield call(toWif, devicePrivateKeyBuf, testnet);

    // Wallet wif
    const walletPath = "m/44'/0'/0'/0"; //testnet ? "m/44'/1'/0'/0" : "m/44'/0'/0'/0";
    const { privateKey: walletPirvateKey } = yield xPrivKey.derive(walletPath);
    const walletPrivKeyBuf = yield walletPirvateKey.bn.toBuffer({ size: 32 });
    const walletWif = yield call(toWif, walletPrivKeyBuf, testnet);

    // Address and address wif
    const addressPath = "m/44'/0'/0'/0/0"; //testnet ? "m/44'/1'/0'/0/0" : "m/44'/0'/0'/0/0";
    const { privateKey } = yield xPrivKey.derive(addressPath);
    const publicKeyBuffer = yield privateKey.publicKey.toBuffer();
    const publicKey = yield publicKeyBuffer.toString('base64');
    const addressPrivKeyBuf = yield privateKey.bn.toBuffer({ size: 32 });
    const addressWif = yield call(toWif, addressPrivKeyBuf, testnet);
    const address = yield call(getChash160, ['sig', { pubkey: publicKey }]);

    const hashedWif = Crypto.createHash('sha256').update(deviceWif).digest("hex");

    yield put(
      createInitialWalletSuccess({
        address,
        addressPath,
        deviceWif,
        walletWif,
        addressWif,
        xPrivKey,
        publicKey,
        privateKey,
        walletPirvateKey,
        walletPath,
        hashedWif,
        walletInit: true
      }),
    );

    if (!mainReducer[hashedWif]) {
      yield put(initDeviceSuccess(hashedWif));
      yield put(
        setToastMessage({
          type: 'SUCCESS',
          message: 'Your wallet is ready to use!',
        }),
      );
    }
  } catch (error) {
    console.log('createInitialWallet ERROR: ', error);
    yield put(createInitialWalletFail());
    yield put(
      setToastMessage({
        type: 'ERROR',
        message: 'Unable to generate new wallet.',
      }),
    );
  }
}

export function* fetchBalances(action) {
  const walletAddress = yield select(selectWalletAddress());
  if (walletAddress) {
    try {
      const balances = yield call(oClient.api.getBalances, [walletAddress]);
      yield put(loadWalletBalancesSuccess(balances));
    } catch (error) {
      yield put(loadWalletBalancesFail());
      yield put(
        setToastMessage({
          type: 'ERROR',
          message: 'Unable to fetch balances.',
        }),
      );
    }
  }
}

export function* initDefaultBots() {
  try {
    const botsPromise = new Promise((resolve, reject) =>
      oClient.api.getBots((err, bots) => {
        if (err) {
          reject(err);
        } else {
          resolve(bots);
        }
      }),
    );
    const bots = yield botsPromise;
    yield put(botsAddSuccess(bots));
  } catch (error) {
    console.log({ error });
  }
}

export function* fetchWitnesses(action) {
  try {
    const witnessesPromise = new Promise((resolve, reject) =>
      oClient.api.getWitnesses((err, witnesses) => {
        if (err) {
          reject(err);
        } else {
          resolve(witnesses);
        }
      }),
    );
    const witnesses = yield witnessesPromise;
    yield put(getWitnessesSuccess(witnesses));
  } catch (error) {
    // console.log({ error });
  }
}

export function* fetchWalletHistory() {
  const walletAddress = yield select(selectWalletAddress());
  if (walletAddress) {
    try {
      const witnesses = yield select(selectWitnesses());
      const params = {
        witnesses: witnesses,
        addresses: [walletAddress],
      };

      const historyPromise = new Promise((resolve, reject) =>
        oClient.api.getHistory(params, (err, history) => {
          if (err) {
            reject(err);
          } else {
            resolve(history);
          }
        }),
      );
      const history = yield historyPromise;
      yield put(loadWalletHistorySuccess(history));
    } catch (error) {
      yield put(loadWalletHistoryFail());
      yield put(
        setToastMessage({
          type: 'ERROR',
          message: 'Unable to fetch transactions.',
        }),
      );
    }
  }
}

export function* sendPayment(action) {
  try {
    const addressWif = yield select(selectAddressWif());
    const { correspondent, params, data } = action.payload;
    let unitId;

    if (data) {
      const multiParams = [
        {
          app: "payment",
          payload: params
        },
        {
          app: "data",
          payload: data
        }
      ];
      unitId = yield call(oClient.post.multi, multiParams, addressWif);
    } else {
      unitId = yield call(oClient.post.payment, params, addressWif);
    }
    yield put(sendPaymentSuccess());
    yield put(
      setToastMessage({
        type: 'SUCCESS',
        message: 'Transaction broadcasted',
      }),
    );
    yield call(fetchBalances, action);
    yield call(fetchWalletHistory, action);
    if (correspondent) {
      const { address, pubKey, hub } = correspondent;
      const { isConnected } = yield call(NetInfo.fetch);
      yield put(addMessageStart({
        address,
        pubKey,
        messageType: 'payment_notification',
        message: unitId,
        isConnected,
        hub
      }));
      yield call(NavigationService.back);
    } else {
      yield call(NavigationService.navigate, 'Wallet');
    }
  } catch (error) {
    const errorMessage = error.message.includes('empty array in {"inputs":[]') ? 'Unable to send payment. Try again later' : error.message;
    yield put(sendPaymentFail());
    yield put(
      setToastMessage({
        type: 'ERROR',
        message: errorMessage,
      }),
    );
  }
}

export function* updateWalletData() {
  const address = yield select(selectWalletAddress());
  yield call(fetchBalances, { address });
  yield call(fetchWalletHistory, { address });
}

export const isAutonomousAgentRequest = address => new Promise((resolve, reject) => {
  oClient.api.getDefinition(address, (err, result) => {
    if (err) {
      reject({ message: err });
    } else if (result && result[0] === "autonomous agent") {
      resolve(true);
    } else {
      resolve(false);
    }
  })
});

function* checkIsAutonomousAgent({ payload }) {
  const { address } = payload;
  const isAutonomousAgent = yield call(isAutonomousAgentRequest, address);
  if (isAutonomousAgent) {
    yield put(
      setToastMessage({
        type: 'WARNING',
        message: "Autonomous Agents are not fully supported yet",
      }),
    );
  }
}

const parseValidParams = ({ walletAddress, query = '', myWalletAddress }) => new Promise((resolve, reject) => {
  if (
    !validationUtils.isValidAddress(walletAddress)
    && !validationUtils.isValidEmail(walletAddress)
    && !walletAddress.match(/^(steem\/|reddit\/|github\/|bitcointalk\/|@).{3,}/i)
    && !walletAddress.match(/^\+\d{9,14}$/)
  ) {
    reject({ message: `address ${walletAddress} is invalid` });
  } else {
    const params = parseQueryString(query);
    const {
      amount, asset, from_address,
      single_address, base64data
    } = params;

    if (amount) {
      const amountInt = parseInt(amount);
      if (`${amountInt}` !== amount) {
        reject({ message: `invalid amount: ${amount}` });
      }
      if (!validationUtils.isPositiveInteger(amountInt)) {
        reject({ message: `nonpositive amount: ${amount}` });
      }
    }

    if (asset && asset !== 'base') {
      reject({ message: 'Wallet doesn\'t support custom assets yet' })
    }

    if (from_address && from_address !== myWalletAddress) {
      reject({ message: `Payment request for ${from_address}, but you have ${myWalletAddress}` })
    }

    if (single_address && single_address !== "1") {
      reject({ message: `invalid single_address: ${single_address}` })
    }

    if (base64data) {
      if (!validationUtils.isValidBase64(base64data)) {
        reject({ message: `invalid parameter base64data` })
      }
      let paymentData = Buffer.from(base64data, 'base64').toString('utf8');
      paymentData = paymentData ? JSON.parse(paymentData) : null;
      if (paymentData) {
        params.data = Object.keys(paymentData).length ? paymentData : null;
      } else {
        reject({ message: `invalid parameter base64data` })
      }
    }

    resolve(params);
  }
});

export function* openPaymentLink({ payload }) {
  try {
    const { walletAddress, query, correspondent } = payload;
    const myWalletAddress = yield select(selectWalletAddress());
    const isAutonomousAgent = yield call(isAutonomousAgentRequest, walletAddress);
    if (isAutonomousAgent) {
      yield put(
        setToastMessage({
          type: 'WARNING',
          message: "Autonomous Agents are not fully supported yet",
        }),
      );
    }
    const params = yield call(parseValidParams, { walletAddress, query, myWalletAddress });
    NavigationService.navigate('MakePayment', { walletAddress, correspondent, ...params });
  } catch (error) {
    yield put(
      setToastMessage({
        type: 'ERROR',
        message: error.message || 'Unable to open payment',
      }),
    );
  }
}

export default function* watch() {
  // yield takeLatest(actionTypes.WALLET_INIT_START, initWallet);
  yield takeLatest(actionTypes.WALLET_INIT_START, init);
  yield takeLatest(actionTypes.INITIAL_WALLET_CREATE_START, createInitialWallet);
  yield takeLatest(actionTypes.WALLET_BALANCES_FETCH_START, fetchBalances);
  yield takeLatest(actionTypes.WALLET_HISTORY_GET_START, fetchWalletHistory);
  yield takeLatest(actionTypes.PAYMENT_SEND_START, sendPayment);
  yield takeLatest(actionTypes.UPDATE_WALLET_DATA, updateWalletData);
  yield takeLatest(actionTypes.GENERATE_SEED_WORDS, generateSeedWords);
  yield takeLatest(actionTypes.OPEN_PAYMENT_LINK, openPaymentLink);
  yield takeLatest(actionTypes.CHECK_IS_AUTONOMOUS_AGENT, checkIsAutonomousAgent);
}
