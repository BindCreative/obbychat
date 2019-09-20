import React from 'react';
import {
  createStackNavigator,
} from 'react-navigation';
import WalletScreen from '../components/WalletScreen';


const WalletStack = createStackNavigator({
  MyWallet: {
    screen: WalletScreen,
    path: '/wallet/main',
  },
},{
  initialRouteName: 'MyWallet',
  defaultNavigationOptions: {
    header: null,
  },
  navigationOptions: ({ navigation }) => ({
    tabBarVisible: ![1, 2].includes(navigation.state.index),
  })
});

export default WalletStack;