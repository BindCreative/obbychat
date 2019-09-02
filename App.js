import React from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import configureStore from './src/store/configureStore';
import Navigator from './src/navigation/MainTabs';


export default function App() {
  const { store, persistor } = configureStore();
  return (
    <Provider store={store}>
      <StatusBar backgroundColor='#ffffff' barStyle='dark-content' hidden={false} />
      <Navigator />
    </Provider>
  );
}