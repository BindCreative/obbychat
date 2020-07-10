console.disableYellowBox = true;
import './shim.js';
import React, { useEffect, useState, useRef } from 'react';
import { AppState, StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PersistGate } from 'redux-persist/integration/react';
import configureStore from './src/store/configureStore';
import Navigator from './src/navigation/Root';
import NavigationService from './src/navigation/service';
import LoadingScreen from './src/screens/LoadingScreen';
import { initWallet } from './src/actions/wallet';
import { oClient } from './src/lib/oCustom';

const App = () => {
  const [store, setStore] = useState(undefined);
  const [persistor, setPersistor] = useState(undefined);
  const [appState, setAppState] = useState('active');
  const [appReady, setAppReady] = useState(false);
  const readynessIntervalRef = useRef();

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

  useEffect(() => {
    if (!appReady) {
      const id = setInterval(() => {
        if (store?.getState && persistor) {
          setAppReady(true);
        } else {
          setAppReady(false);
        }
      }, 4000);
      readynessIntervalRef.current = id;
    }

    return () => {
      clearInterval(readynessIntervalRef.current);
    };
  }, [appReady, store, persistor]);

  // TODO: close and restart hub connection
  // useEffect(() => {
  //   if (appState !== 'active') {
  //     oClient.close();
  //   }
  // }, [appState]);

  if (!appReady) {
    return (
      <SafeAreaProvider>
        <LoadingScreen messages={['Starting up']} />
      </SafeAreaProvider>
    );
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
