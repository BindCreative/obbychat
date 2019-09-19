import React from 'react';
import {
  createStackNavigator,
  createAppContainer,
} from 'react-navigation';
import MainStack from './MainStack';
import QRScannerScreen from '../components/QRScannerScreen';
import QRCodeScreen from '../components/QRCodeScreen';
import PaymentScreen from './../components/PaymentScreen';
import RequestPaymentScreen from './../components/RequestPaymentScreen';
import Header from './../components/Header';


const RootNav = createStackNavigator({
  MainStack: {
    screen: MainStack,
    navigationOptions: {
      header: null,
    },
  },
  ContactScanner: {
    screen: props => <QRScannerScreen {...props} onScanned={({ type, data }) => console.log(type, data)} backRoute='ChatStack' />,
    path: '/chat/scan',
    navigationOptions: {
      header: null,
      transitionConfig: {
        isModal: true,
      },
    },
  },
  MyQR: {
    screen: (props, compProps) => <QRCodeScreen {...props} {...compProps} qrData={{ foo: 'bar' }} backRoute='ChatStack' />,
    path: '/chat/my-qr',
    navigationOptions: {
      header: props => <Header {...props} size='compact' titlePosition='center' hasBackButton />,
      title: 'My QR code',
      transitionConfig: {
        isModal: true,
      },
    },
  },
  WalletScanner: {
    screen: props => <QRScannerScreen {...props} onScanned={({ type, data }) => console.log(type, data)} backRoute='WalletStack' />,
    path: '/wallet/scan',
    navigationOptions: {
      header: null,
      transitionConfig: {
        isModal: true,
      },
    },
  },
  MyWalletQR: {
    screen: (props, compProps) => <QRCodeScreen {...props} {...compProps} qrData={{ foo: 'bar' }} backRoute='WalletStack' />,
    path: '/wallet/my-qr',
    navigationOptions: {
      title: 'My wallet address',
      header: props => <Header {...props} size='compact' titlePosition='center' hasBackButton />,
      transitionConfig: {
        isModal: true,
      },
    },
  },
  MakePayment: {
    screen: props => <PaymentScreen {...props} />,
    path: '/wallet/make-payment',
    navigationOptions: {
      title: 'Enter amount',
      header: props => <Header {...props} size='compact' titlePosition='center' hasBackButton />,
      tabBarIcon: null,
      tabBarVisible: false,
      transitionConfig: {
        isModal: true,
      },
    }
  },
  RequestPayment: {
    screen: props => <RequestPaymentScreen {...props} />,
    path: '/wallet/request-payment',
    navigationOptions: {
      title: 'Enter amount',
      header: props => <Header {...props} size='compact' titlePosition='center' hasBackButton />,
      tabBarIcon: null,
      tabBarVisible: false,
      transitionConfig: {
        isModal: true,
      },
    }
  },
}, {
  initialRouteName: 'MainStack',
  mode: 'modal',
});

export default createAppContainer(RootNav);