import React, { useEffect, useState, useRef } from 'react';
import * as PropTypes from 'prop-types';
import { useDispatch, connect } from "react-redux";
import { AppState, StatusBar, InteractionManager, Platform, Linking, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler';
import { useNetInfo } from "@react-native-community/netinfo";

import common from '../../constants/common';
import { oClient } from '../../lib/oCustom';

import Navigator from '../../navigation/Root';
import NavigationService from '../../navigation/service';
import LoadingScreen from '../../screens/LoadingScreen';
import { initWallet } from '../../actions/wallet';
import { setToastMessage } from '../../actions/app';
import { reSubscribeToHub } from "../../actions/device";
import { stopSubscribeToHub } from "../../sagas/device";

import parseUrl from '../../lib/parseUrl';

import { selectWalletInit, selectWalletInitAddress } from "../../selectors/wallet";

const prefix = 'obyte-tn:|obyte';

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

const App = ({ walletInit, walletAddress }) => {
  const dispatch = useDispatch();
  const [appReady, setAppReady] = useState(false);
  const [redirectParams, setRedirectParams] = useState(null);
  const netInfo = useNetInfo();
  const readyRef = useRef({ appReady });
  const inFocusRef = useRef(true);
  const netInfoRef = useRef(netInfo.isConnected);
  const lastInfocusRef = useRef('active');

  const redirect = () => {
    if (redirectParams) {
      const { navigate } = NavigationService;
      const { type, message, ...params } = redirectParams;
      switch (type) {
        case common.urlTypes.error:
          return dispatch(setToastMessage({ type: 'ERROR', message }));
        case common.urlTypes.pairing:
          return navigate('ChatStack', { type, ...params });
        case common.urlTypes.payment:
          return navigate('MakePayment', { ...params, title: 'Enter amount' });
      }
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
      const urlData = parseUrl(url, walletAddress);
      setRedirectParams(urlData);
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
          stopSubscribeToHub();
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
        stopSubscribeToHub();
      }
      lastInfocusRef.current = appState;
    }
  };

  useEffect(
    () => {
      oClient.client.ws.addEventListener('close', init);
      oClient.client.ws.close();
      Linking.getInitialURL().then(handleLinkingUrl);
      Linking.addEventListener('url', handleIosLinkingUrl);
      AppState.addEventListener('change', changeListener);
      return () => {
        AppState.removeEventListener('change', changeListener);
      };
    },
    []
  );

  useEffect(
    () => {
      if (walletInit) {
        setTimeout(() => {
          setAppReady(true);
          readyRef.current.appReady = true;
        }, 1000);
      }
    },
    [walletInit]
  );

  useEffect(
    () => {
      if (walletInit && redirectParams) {
        redirect()
      }
    },
    [walletInit, redirectParams]
  );

  return (
    <SafeAreaProvider>
      {!appReady && <LoadingScreen />}
      <StatusBar backgroundColor='#ffffff' barStyle='dark-content' />
      <Navigator
        ref={navigatorRef => {
          NavigationService.setTopLevelNavigator(navigatorRef);
        }}
        uriPrefix={prefix}
      />
    </SafeAreaProvider>
  );
};

App.propTypes = {
  walletInit: PropTypes.bool.isRequired,
  walletAddress: PropTypes.string
};

App.defaultProps = {
  walletAddress: ''
};

const mapStateToProps = state => ({
  walletInit: selectWalletInit(state),
  walletAddress: selectWalletInitAddress(state)
});

export default connect(mapStateToProps, null)(App);
