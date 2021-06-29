import React, { useEffect, useState, useRef, useMemo } from 'react';
import * as PropTypes from 'prop-types';
import { useDispatch, connect } from "react-redux";
import { createStructuredSelector } from 'reselect';
import { AppState, StatusBar, InteractionManager, Platform, Linking, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { setJSExceptionHandler } from 'react-native-exception-handler';
import { useNetInfo } from "@react-native-community/netinfo";

import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

import { oClient, testnet } from '../../lib/oCustom';

import Navigator from '../../navigation/Root';
import NavigationService from '../../navigation/service';
import LoadingScreen from '../../screens/LoadingScreen';
import PasswordScreen from '../../screens/PasswordScreen';
import { initWallet } from '../../actions/wallet';
import { reSubscribeToHub, stopSubscribeToHub, setFcmToken } from "../../actions/device";
import { openLink } from "../../actions/device";

import { selectSeedWords, selectPasswordProtected } from "../../selectors/secure";
import { selectWalletInitAddress, selectAccountInit, selectWalletInit, selectConnectionStatus } from "../../selectors/temporary";

// const prefix = 'obyte-tn:|obyte';
const prefix = testnet ? 'obyte-tn:|byteball-tn' : 'obyte:|byteball';

const PUSH_CHANEL_ID = 'obby-chat-push-chanel-id';

// oClient.justsaying

setJSExceptionHandler((error, isFatal) => {
  if (error && isFatal) {
    console.log('caught global error');
    Alert.alert(
      "Unexpected error occurred",
      `
      Fatal Error
      ${error.name}
      ${error.message}
    `
    )
  }
}, true);

let wasConnected = true;

const createChanel = () => new Promise((resolve) => {
  PushNotification.createChannel({ channelId: PUSH_CHANEL_ID, channelName: "Obby Chat push chanel id" }, resolve);
});

export const requestNotificationsPermission = async () => {
  const authStatus = await messaging().requestPermission();
  return authStatus === messaging.AuthorizationStatus.AUTHORIZED
    || authStatus === messaging.AuthorizationStatus.PROVISIONAL;
};

const App = ({
  walletAddress, seedWords, passwordProtected, walletInit, accountInit, connectedToHub
}) => {
  const dispatch = useDispatch();
  const [appReady, setAppReady] = useState(false);
  const [redirectParams, setRedirectParams] = useState(null);
  const netInfo = useNetInfo();
  const navigationRef = useRef(null);
  const readyRef = useRef({ appReady });
  const inFocusRef = useRef(true);
  const netInfoRef = useRef(netInfo.isConnected);
  const lastInfocusRef = useRef('active');

  const getFcmToken = async () => {
    return await messaging().getToken();
  };

  const handlePush = async (message) => {
    console.log('message:', message);
    const { notification, messageId } = message;
    const { title, body, sound } = notification;
    if (Platform.OS === 'android') {
      PushNotification.localNotification({
        channelId: PUSH_CHANEL_ID,
        title,
        message: body
      });
    }
    if (Platform.OS === 'ios') {
      PushNotificationIOS.addNotificationRequest({
        id: messageId,
        title,
        body
      })
    }
  };

  const startFcm = async () => {
    let enabled = true;
    if (Platform.OS === 'ios') {
      enabled = await requestNotificationsPermission();
    } else {
      await createChanel();
    }
    if (enabled) {
      const fcmToken = await getFcmToken();
      dispatch(setFcmToken(fcmToken));
    }
  };

  useEffect(
    () => {
      startFcm();
      messaging().setBackgroundMessageHandler(handlePush);
      const unsubscribe = messaging().onMessage(handlePush);

      return unsubscribe;
    },
    []
  );

  const redirect = () => {
    if (redirectParams) {
      dispatch(openLink({ link: redirectParams }));
      setRedirectParams(null);
    }
  };

  const resubscribe = () => {
    setTimeout(() => dispatch(reSubscribeToHub()), 100);
    oClient.client.ws.removeEventListener('close', resubscribe);
  };

  const reconnectToHub = () => {
    if (oClient.client.open) {
      oClient.client.ws.addEventListener('close', resubscribe);
      oClient.client.ws.close();
    } else {
      dispatch(reSubscribeToHub());
    }
  };

  const handleLinkingUrl = (url) => {
    if (url) {
      setRedirectParams(url);
    }
  };

  const handleIosLinkingUrl = (event) => {
    handleLinkingUrl(event.url);
  };

  const init = () => {
    setTimeout(() => dispatch(initWallet({ address: walletAddress })), 100);
    oClient.client.ws.removeEventListener('close', init);
  };

  useEffect(
    () => {
      const { isConnected } = netInfo;
      netInfoRef.current = isConnected;
      if (appReady) {
        if (!isConnected) {
          wasConnected = false;
          dispatch(stopSubscribeToHub());
        } else {
          if (!wasConnected) {
            reconnectToHub();
          }
          wasConnected = true;
        }
      }
    },
    [netInfo]
  );

  const changeListener = (appState) => {
    if (readyRef.current.appReady) {
      inFocusRef.current = appState !== 'background';
      if (appState === 'active' && lastInfocusRef.current === 'background') {
        reconnectToHub();
      } else if (appState === 'background') {
        dispatch(stopSubscribeToHub());
      }
      lastInfocusRef.current = appState;
    }
  };

  const passwordNeeded = useMemo(
    () => passwordProtected && !walletInit,
    [passwordProtected, walletInit]
  );

  useEffect(
    () => {
      if (!passwordNeeded) {
        oClient.client.ws.addEventListener('close', init);
      }
      Linking.getInitialURL().then(handleLinkingUrl);
      Linking.addEventListener('url', handleIosLinkingUrl);
      AppState.addEventListener('change', changeListener);
      oClient.client.ws.close();
      return () => {
        AppState.removeEventListener('change', changeListener);
      };
    },
    []
  );

  useEffect(
    () => {
      if (accountInit) {
        setTimeout(() => {
          setAppReady(true);
          readyRef.current.appReady = true;
        }, 1000);
      }
    },
    [accountInit]
  );

  useEffect(
    () => {
      if (accountInit && redirectParams && connectedToHub) {
        redirect();
      }
    },
    [accountInit, redirectParams, connectedToHub]
  );

  const getRouteData = ({ routes, index }) => {
    const route = routes[index];
    if (route.routes) {
      return getRouteData(route)
    } else {
      return route;
    }
  };

  const onNavigationStateChange = () => {
    const route = getRouteData(navigationRef.current.state.nav);
    // console.log(route);
  };

  return (
    <SafeAreaProvider>
      {!appReady && <LoadingScreen />}
      {passwordNeeded && <PasswordScreen />}
      {accountInit && (
        <Navigator
          ref={navigatorRef => {
            navigationRef.current = navigatorRef;
            NavigationService.setTopLevelNavigator(navigatorRef);
          }}
          onNavigationStateChange={onNavigationStateChange}
          uriPrefix={prefix}
        />
      )}
      <StatusBar backgroundColor='#ffffff' barStyle='dark-content' />
    </SafeAreaProvider>
  );
};

App.propTypes = {
  walletAddress: PropTypes.string,
  seedWords: PropTypes.string.isRequired,
  passwordProtected: PropTypes.bool.isRequired,
  walletInit: PropTypes.bool.isRequired,
  accountInit: PropTypes.bool.isRequired
};

App.defaultProps = {
  walletAddress: ''
};

const mapStateToProps = createStructuredSelector({
  walletAddress: selectWalletInitAddress(),
  seedWords: selectSeedWords(),
  passwordProtected: selectPasswordProtected(),
  walletInit: selectWalletInit(),
  accountInit: selectAccountInit(),
  connectedToHub: selectConnectionStatus()
});

export default connect(mapStateToProps, null)(App);
