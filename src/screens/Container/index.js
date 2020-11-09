import React, { useEffect, useState, useRef } from 'react';
import * as PropTypes from 'prop-types';
import { useDispatch, connect } from "react-redux";
import { AppState, StatusBar, InteractionManager, Platform, Linking, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler';

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
  if (error) {
    console.log('caught global error');
    Alert.alert(
      "Unexpected error occurred",
      `
    Error: ${isFatal ? "Fatal" : ""}
    ${error.name}
    ${error.message}
    `
    )
  }
}, true);

const App = ({ walletInit, walletAddress }) => {
  const dispatch = useDispatch();

  const [appReady, setAppReady] = useState(false);
  const [appHidden, setAppHidden] = useState(false);
  const [redirectParams, setRedirectParams] = useState(null);
  const timeoutId = useRef();

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
          return navigate('MakePayment', params);
      }
    }
  };

  const handleLinkingUrl = (url) => {
    if (url) {
      const urlData = parseUrl(url);
      setRedirectParams(urlData);
      if (walletInit) {
        redirect();
      }
    }
  };

  const handleIosLinkingUrl = (event) => {
    handleLinkingUrl(event.url);
  };

  useEffect(() => {
    oClient.client.ws.onclose = () => {
      setTimeout(() => dispatch(initWallet({ address: walletAddress })), 100);
    };
    oClient.close();
    Linking.getInitialURL().then(handleLinkingUrl);
    Linking.addEventListener('url', handleIosLinkingUrl);
  }, []);

  useEffect(
    () => {
      if (walletInit) {
        redirect();
        timeoutId.current = setTimeout(() => setAppReady(true), 1000);
      } else {
        clearTimeout(timeoutId.current);
      }
    },
    [walletInit]
  );

  const changeListener = (appState) => {
    console.log(appState);
    if (appState === 'active') {
      // if (Platform.OS === 'android') {
      //   setTimeout(() => setAppHidden(false), 4000);
      // }
      if (oClient.client.open) {
        oClient.client.ws.onclose = () => {
          setTimeout(() => dispatch(reSubscribeToHub()), 100);
        };
        oClient.close();
      } else {
        dispatch(reSubscribeToHub())
      }
    } else {
      // if (Platform.OS === 'android') {
      //   setAppHidden(true);
      // }
      oClient.client.ws.onclose = () => null;
      stopSubscribeToHub();
    }
  };

  useEffect(() => {
    AppState.addEventListener('change', changeListener);
    return () => {
      AppState.removeEventListener('change', changeListener);
    };
  }, []);

  return (
    <SafeAreaProvider>
      {(!appReady || appHidden) && <LoadingScreen />}
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
