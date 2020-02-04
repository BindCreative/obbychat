import React from 'react';
import { createStackNavigator } from 'react-navigation-stack';
import WalletScreen from '../screens/WalletScreen';

const WalletStack = createStackNavigator(
  {
    MyWallet: {
      screen: WalletScreen,
      path: '/wallet/main',
    },
  },
  {
    initialRouteName: 'MyWallet',
    defaultNavigationOptions: {
      headerShown: false,
    },
  },
);

export default WalletStack;
