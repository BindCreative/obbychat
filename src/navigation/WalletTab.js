import React from 'react';
import {
  createStackNavigator,
} from 'react-navigation';
import WalletScreen from '../components/WalletScreen';
import QRScannerScreen from '../components/QRScannerScreen';
import QRCodeScreen from '../components/QRCodeScreen';
import { colors } from './../constants';


const WalletTab = createStackNavigator({
  Wallet: {
    screen: WalletScreen,
    path: 'wallet',
  },
  WalletScanner: {
    screen: props => <QRScannerScreen {...props} onScanned={({ type, data }) => console.log(type, data)} />,
    path: '/chat/contact-scan',
    navigationOptions: {
      header: null,
    },
  },
  MyWalletQR: {
    screen: (props, compProps ) => <QRCodeScreen {...props} {...compProps} qrData={{ foo: 'bar' }} />,
    path: '/wallet/my-qr',
    navigationOptions: {
      title: 'My wallet address',
      headerStyle: {
        maxHeight: 200,
        backgroundColor: colors.white,
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTitleStyle: {
        fontWeight: 'bold',
        color: colors.black,
        fontSize: 20,
        marginLeft: 15,
      },
    },
  },
},{
  initialRouteName: 'Wallet',
  navigationOptions: ({ navigation }) => ({
    tabBarVisible: ![1, 2].includes(navigation.state.index),
  })
});

export default WalletTab;