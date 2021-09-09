import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
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
import {
  reSubscribeToHub, stopSubscribeToHub, setFcmToken, setHistoryState,
  openLink, runNfcReader, stopNfcReader, stopHceSimulator
} from "../../actions/device";

import { selectSeedWords, selectPasswordProtected } from "../../selectors/secure";
import {
  selectWalletInitAddress, selectAccountInit,
  selectWalletInit, selectConnectionStatus, selectHistoryState
} from "../../selectors/temporary";

const prefix = testnet ? 'obyte-tn:|byteball-tn' : 'obyte:|byteball';

const PUSH_CHANEL_ID = 'obby-chat-push-chanel-id-4-300';

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
  PushNotification.getChannels((channels) => {
    channels.forEach((channel) => {
      if (channel !== PUSH_CHANEL_ID) {
        PushNotification.deleteChannel(channel);
      }
    });
  });
  PushNotification.createChannel({ channelId: PUSH_CHANEL_ID, channelName: "Obby Chat push chanel id", largeIcon: 'ic_launcher' }, resolve);
});

export const requestNotificationsPermission = async () => {
  const authStatus = await messaging().requestPermission();
  return authStatus === messaging.AuthorizationStatus.AUTHORIZED
    || authStatus === messaging.AuthorizationStatus.PROVISIONAL;
};

const showPush = async (push) => {
  const { data } = push;
  const {
    title, message, notificationId, pubkey
  } = data;
  if (Platform.OS === 'android') {
    PushNotification.localNotification({
      largeIcon: '',
      channelId: PUSH_CHANEL_ID,
      title,
      message,
      data
    });
  } else {
    PushNotificationIOS.addNotificationRequest({
      id: notificationId,
      title,
      body: message,
      userInfo: { pubkey }
    })
  }
};

PushNotification.configure({});

const App = ({
  walletAddress, seedWords, passwordProtected, walletInit, accountInit, connectedToHub, historyState
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
  const historyStateRef = useRef(historyState);

  useEffect(
    () => {
      historyStateRef.current = historyState
    },
    [historyState]
  );

  const getFcmToken = async () => {
    return await messaging().getToken();
  };

  const startFcm = async () => {
    if (Platform.OS === 'ios') {
      await requestNotificationsPermission();
    } else {
      await createChanel();
    }
    const fcmToken = await getFcmToken();
    dispatch(setFcmToken(fcmToken));
  };

  const handlePush = async (push) => {
    const { data: { pubkey } } = push;
    if (
      historyStateRef
      && historyStateRef.current
      && historyStateRef.current.routeName === "Chat"
      && historyStateRef.current.params.correspondent.pubKey === pubkey
    ) {
      return null;
    } else {
      await showPush(push);
    }
  };

  const handleMessage = (notification) => {
    if (notification) {
      if (notification.userInteraction) {
        if (notification && notification.data) {
          const { pubkey } = notification.data;
          setRedirectParams({ pubkey });
          notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
      } else {
        handlePush(notification);
      }
    }
  };

  useEffect(
    () => {
      startFcm();
      PushNotification.onNotification = handleMessage;
      PushNotification.popInitialNotification(handleMessage);
      if (Platform.OS === 'ios') {
        PushNotificationIOS.setApplicationIconBadgeNumber(0);
      } else {
        const unsubscribe = messaging().onMessage(handlePush);
        return unsubscribe;
      }
    },
    []
  );

  const redirect = () => {
    if (redirectParams) {
      dispatch(openLink(redirectParams));
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

  const handleLinkingUrl = (link) => {
    if (link) {
      setRedirectParams({ link });
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
      if (accountInit) {
        setTimeout(() => {
          setAppReady(true);
          readyRef.current.appReady = true;
          if (Platform.OS === 'android') {
            dispatch(runNfcReader());
          }
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

  const stopNfc = () => {
    dispatch(stopNfcReader());
    dispatch(stopHceSimulator());
  };

  const appStateListener = (appState) => {
    if (appState === 'active') {
      dispatch(runNfcReader());
    } else {
      stopNfc();
    }
  };

  useEffect(
    () => {
      if (!passwordNeeded) {
        oClient.client.ws.addEventListener('close', init);
      }
      Linking.getInitialURL().then(handleLinkingUrl);
      Linking.addEventListener('url', handleIosLinkingUrl);
      AppState.addEventListener('change', changeListener);
      if (oClient.client.open) {
        oClient.client.ws.close();
      } else {
        oClient.client.onConnectCallback = () => {
          oClient.client.ws.close();
        }
      }
      return () => {
        AppState.removeEventListener('change', changeListener);
      };
    },
    []
  );

  useEffect(
    () => {
      if (Platform.OS === 'android') {
        AppState.addEventListener('change', appStateListener);
        return () => {
          AppState.removeEventListener('change', appStateListener);
          stopNfc();
        };
      }
    },
    []
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
    if (navigationRef && navigationRef.current) {
      const route = getRouteData(navigationRef.current.state.nav);
      dispatch(setHistoryState(route));
    }
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
  accountInit: PropTypes.bool.isRequired,
  historyState: PropTypes.object
};

App.defaultProps = {
  walletAddress: '',
  historyState: null
};

const mapStateToProps = createStructuredSelector({
  walletAddress: selectWalletInitAddress(),
  seedWords: selectSeedWords(),
  passwordProtected: selectPasswordProtected(),
  walletInit: selectWalletInit(),
  accountInit: selectAccountInit(),
  connectedToHub: selectConnectionStatus(),
  historyState: selectHistoryState()
});

export default connect(mapStateToProps, null)(App);
