console.disableYellowBox = true;
import './shim.js';import React from "react";
import { AppRegistry } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import Container from './src/screens/Container';

import configureStore from './src/store/configureStore';

const storeSetup = configureStore();

GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;

const App = () => (
  <Provider store={storeSetup.store}>
    <PersistGate persistor={storeSetup.persistor}>
      <Container />
    </PersistGate>
  </Provider>
);

export default App;
