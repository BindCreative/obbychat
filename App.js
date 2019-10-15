import './shim.js';
import React from 'react';
import { Provider } from 'react-redux';
import { AppLoading } from 'expo';
import * as Font from 'expo-font';
import { PersistGate } from 'redux-persist/integration/react';
import configureStore from './src/store/configureStore';
import Navigator from './src/navigation/Root';
import NavigationService from './src/navigation/service';
import { initWallet } from './src/actions/wallet';


class App extends React.Component {

  constructor(props) {
    super(props);
    const { store, persistor } = configureStore();
    this.store = store;
    this.persistor = persistor;
    this.state = { loading: true };
  }

  async componentDidMount() {
    await Font.loadAsync({
      Roboto: require('./node_modules/native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('./node_modules/native-base/Fonts/Roboto_medium.ttf')
    });
    this.setState({ loading: false });
    this.store.dispatch(initWallet());
  }

  render() {
    if (this.state.loading) {
      return (
        <AppLoading />
      );
    }

    return (
      <Provider store={this.store}>
        <PersistGate loading={<AppLoading />} persistor={this.persistor}>
          <Navigator
            ref={navigatorRef => {
              NavigationService.setTopLevelNavigator(navigatorRef);
            }}
          />
        </PersistGate>
      </Provider>
    );
  }
}

export default App;