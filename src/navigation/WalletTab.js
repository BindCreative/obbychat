import React from 'react';
import {
  createStackNavigator,
} from 'react-navigation';
import WalletScreen from '../components/WalletScreen';


const WalletTab = createStackNavigator({
  Wallet: {
    screen: WalletScreen,
    path: 'wallet',
  },
},{ initialRouteName: 'Wallet' });

export default WalletTab;