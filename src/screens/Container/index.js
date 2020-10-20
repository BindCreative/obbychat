import React, { useEffect, useState, useRef } from 'react';
import * as PropTypes from 'prop-types';
import { useDispatch, connect } from "react-redux";
import { AppState, StatusBar, InteractionManager, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { oClient } from '../../lib/oCustom';

import Navigator from '../../navigation/Root';
import NavigationService from '../../navigation/service';
import LoadingScreen from '../../screens/LoadingScreen';
import { initWallet } from '../../actions/wallet';
import { reSubscribeToHub } from "../../actions/device";
import { stopSubscribeToHub } from "../../sagas/device";

import { selectWalletInit, selectWalletInitAddress } from "../../selectors/wallet";

const App = ({ walletInit, walletAddress }) => {
  const dispatch = useDispatch();

  const [appState, setAppState] = useState('active');
  const [appReady, setAppReady] = useState(false);
  const [appHidden, setAppHidden] = useState(false);
  const timeoutId = useRef();

  useEffect(() => {
    oClient.close();
    setTimeout(() => dispatch(initWallet({ address: walletAddress })), 100);
  }, []);

  useEffect(
    () => {
      if (walletInit) {
        timeoutId.current = setTimeout(() => setAppReady(true), 4000);
      } else {
        clearTimeout(timeoutId.current);
      }
    },
    [walletInit]
  );

  useEffect(
    () => {
      if (appState === 'active') {
        if (Platform.OS === 'android') {
          setTimeout(() => setAppHidden(false), 4000);
        }
        // dispatch(reSubscribeToHub());
      } else {
        if (Platform.OS === 'android') {
          setAppHidden(true);
        }
        // stopSubscribeToHub();
      }
    },
    [appState]
  );

  const changeListener = nextAppState => setAppState(nextAppState);

  useEffect(() => {
    AppState.addEventListener('change', changeListener);
    return () => {
      AppState.removeEventListener('change', changeListener);
    };
  }, []);

  // TODO: close and restart hub connection
  // useEffect(() => {
  //   if (appState !== 'active') {
  //     oClient.close();
  //   }
  // }, [appState]);

  return (
    <SafeAreaProvider>
      {(!appReady || appHidden) && <LoadingScreen />}
      {/*{!appReady && <LoadingScreen messages={['Starting up']} />}*/}
      <StatusBar backgroundColor='#ffffff' barStyle='dark-content' />
      <Navigator
        ref={navigatorRef => {
          NavigationService.setTopLevelNavigator(navigatorRef);
        }}
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
