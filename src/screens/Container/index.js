import React, { useEffect, useState } from 'react';
import * as PropTypes from 'prop-types';
import { useDispatch, connect } from "react-redux";
import { AppState, StatusBar, InteractionManager } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Navigator from '../../navigation/Root';
import NavigationService from '../../navigation/service';
import LoadingScreen from '../../screens/LoadingScreen';
import { initWallet } from '../../actions/wallet';

import { selectWalletInit, selectWalletInitAddress } from "../../selectors/wallet";

const App = ({ walletInit, walletAddress }) => {
  const dispatch = useDispatch();

  const [appState, setAppState] = useState('active');
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    setTimeout(() => dispatch(initWallet({ address: walletAddress })), 100);
  }, []);

  useEffect(
    () => {
      if (walletInit) {
        setTimeout(() => setAppReady(true), 4000);
      }
    },
    [walletInit]
  );

  useEffect(() => {
    AppState.addEventListener('change', nextAppState =>
      setAppState(nextAppState),
    );
    return () => {
      AppState.removeEventListener('change', nextAppState =>
        setAppState(nextAppState),
      );
    };
  }, [setAppState]);

  // TODO: close and restart hub connection
  // useEffect(() => {
  //   if (appState !== 'active') {
  //     oClient.close();
  //   }
  // }, [appState]);

  // if (!appReady) {
  //   return (
  //     <SafeAreaProvider>
  //       <LoadingScreen messages={['Starting up']} />
  //     </SafeAreaProvider>
  //   );
  // }

  return (
    <SafeAreaProvider>
      {!appReady && <LoadingScreen messages={['Starting up']} />}
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
