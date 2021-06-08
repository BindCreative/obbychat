console.disableYellowBox = true;
import './shim.js';
import React, { useState, useEffect } from "react";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider as PaperProvider } from 'react-native-paper';
import { RootSiblingParent } from 'react-native-root-siblings';

import NotificationService from './NotificationService';

import Container from './src/screens/Container';

import configureStore from './src/store/configureStore';

export const storeSetup = configureStore();

const App = () => {
  const [deviceToken, setDeviceToken] = useState("");

  const handleRegister = (token) => {
    setDeviceToken(token);
    console.log(token);
  };

  const handleNotification = (notification) => {
    console.log(notification);
  };

  const notificationService = new NotificationService(handleRegister, handleNotification);

  return (
    <RootSiblingParent>
      <Provider store={storeSetup.store}>
        <PersistGate persistor={storeSetup.persistor}>
          <PaperProvider>
            <Container />
          </PaperProvider>
        </PersistGate>
      </Provider>
    </RootSiblingParent>
  );
};

export default App;
