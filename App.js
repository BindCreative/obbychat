console.disableYellowBox = true;
import './shim.js';
import React, { useEffect, useState } from 'react';
import { AppState, StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PersistGate } from 'redux-persist/integration/react';
import configureStore from './src/store/configureStore';
import Navigator from './src/navigation/Root';
import NavigationService from './src/navigation/service';
import { initWallet } from './src/actions/wallet';
import { oClient } from './src/lib/oCustom';

const App = () => {
  const [store, setStore] = useState(undefined);
  const [persistor, setPersistor] = useState(undefined);
  const [appState, setAppState] = useState('active');

  useEffect(() => {
    const storeSetup = configureStore();
    setStore(storeSetup.store);
    setPersistor(storeSetup.persistor);
  }, [configureStore, initWallet]);
  useEffect(() => {
    if (!!store) {
      store.dispatch(initWallet());
    }
  }, [store]);
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

  if (!store | !persistor) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <SafeAreaProvider>
          <StatusBar backgroundColor='#ffffff' barStyle='dark-content' />
          <Navigator
            ref={navigatorRef => {
              NavigationService.setTopLevelNavigator(navigatorRef);
            }}
          />
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
