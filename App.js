console.disableYellowBox = true;
import './shim.js';
import React from "react";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider as PaperProvider } from 'react-native-paper';

import Container from './src/screens/Container';

import configureStore from './src/store/configureStore';

const storeSetup = configureStore();

GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;

const App = () => (
  <Provider store={storeSetup.store}>
    <PersistGate persistor={storeSetup.persistor}>
      <PaperProvider>
        <Container />
      </PaperProvider>
    </PersistGate>
  </Provider>
);

export default App;
