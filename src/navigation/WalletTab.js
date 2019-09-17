import React from 'react';
import {
  createStackNavigator,
} from 'react-navigation';
import WalletScreen from '../components/WalletScreen';
import QRScannerScreen from '../components/QRScannerScreen';
import QRCodeScreen from '../components/QRCodeScreen';
import PaymentScreen from './../components/PaymentScreen';
import RequestPaymentScreen from './../components/RequestPaymentScreen';
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
      transitionConfig: {
        isModal: true,
      },
    },
  },
  MyWalletQR: {
    screen: (props, compProps ) => <QRCodeScreen {...props} {...compProps} qrData={{ foo: 'bar' }} />,
    path: '/wallet/my-qr',
    navigationOptions: {
      title: 'My wallet address',
      header: props => <Header {...props} hasBackButton={true} titlePosition='center' size='compact' />,
      transitionConfig: {
        isModal: true,
      },
    },
  },
  MakePayment: {
    screen: PaymentScreen,
    path: '/wallet/make-payment',
    navigationOptions: {
      title: 'Enter amount',
      tabBarIcon: null,
      tabBarVisible: false,
      header: props => <Header {...props} hasBackButton={true} titlePosition='center' size='compact' />,
      transitionConfig: {
        isModal: true,
      },
    }
  },
  RequestPayment: {
    screen: RequestPaymentScreen,
    path: '/wallet/request-payment',
    navigationOptions: {
      title: 'Enter amount',
      tabBarIcon: null,
      tabBarVisible: false,
      header: props => <Header {...props} hasBackButton={true} titlePosition='center' size='compact' />,
      transitionConfig: {
        isModal: true,
      },
    }
  },
},{
  initialRouteName: 'Wallet',
  navigationOptions: ({ navigation }) => ({
    tabBarVisible: ![1, 2].includes(navigation.state.index),
  })
});

export default WalletTab;