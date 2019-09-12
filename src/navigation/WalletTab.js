import React from 'react';
import {
  createStackNavigator,
} from 'react-navigation';
import WalletScreen from '../components/WalletScreen';
import QRScannerScreen from '../components/QRScannerScreen';
import QRCodeScreen from '../components/QRCodeScreen';
import Header from '../components/Header';


const WalletTab = createStackNavigator({
  Wallet: {
    screen: WalletScreen,
    path: '/wallet/main',
  },
  WalletScanner: {
    screen: props => <QRScannerScreen {...props} onScanned={({ type, data }) => console.log(type, data)} />,
    path: '/wallet/scan',
    navigationOptions: {
      header: null,
    },
  },
  MyWalletQR: {
    screen: (props, compProps ) => <QRCodeScreen {...props} {...compProps} qrData={{ foo: 'bar' }} />,
    path: '/wallet/my-qr',
    navigationOptions: {
      title: 'My wallet address',
      header: props => <Header {...props} hasBackButton={true} titlePosition='center' size='compact' />,
    },
  },
},{
  initialRouteName: 'Wallet',
  navigationOptions: ({ navigation }) => ({
    tabBarVisible: ![1, 2].includes(navigation.state.index),
  })
});

export default WalletTab;