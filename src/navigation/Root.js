import React from 'react';
import {
  createStackNavigator,
  createAppContainer,
} from 'react-navigation';
import MainStack from './MainStack';
import QRScannerScreen from '../components/QRScannerScreen';
import QRCodeScreen from '../components/QRCodeScreen';
import PaymentScreen from './../components/PaymentScreen';
import SeedWordsScreen from './../components/SeedWordsScreen';
import TransactionInfoScreen from './../components/TransactionInfoScreen';
import Header from './../components/Header';


const RootNav = createStackNavigator({
  MainStack: {
    screen: MainStack,
  },
  ContactScanner: {
    screen: props => <QRScannerScreen {...props} onScanned={({ type, data }) => console.log(type, data)} backRoute='ChatStack' />,
    path: '/chat/scan',
  },
  MyQR: {
    screen: (props, compProps) => <QRCodeScreen {...props} {...compProps} backRoute='ChatStack' />,
    path: '/chat/my-qr',
    navigationOptions: {
      header: props => <Header {...props} size='compact' titlePosition='center' hasBackButton />,
      title: 'My QR code',
    },
  },
  WalletScanner: {
    screen: props => <QRScannerScreen {...props} onScanned={({ type, data }) => console.log(type, data)} backRoute='WalletStack' />,
    path: '/wallet/scan',
  },
  MyWalletQR: {
    screen: (props, compProps) => <QRCodeScreen {...props} {...compProps} backRoute='WalletStack' />,
    path: '/wallet/my-qr',
    navigationOptions: {
      title: 'My wallet address',
      header: props => <Header {...props} size='compact' titlePosition='center' hasBackButton />,
    },
  },
  MakePayment: {
    screen: props => <PaymentScreen {...props} method='send' />,
    path: '/wallet/make-payment',
    navigationOptions: ({ navigation }) => ({
      title: typeof(navigation.state.params) === 'undefined' || typeof(navigation.state.params.title) === 'undefined' ? '': navigation.state.params.title,
      header: props => <Header {...props} size='compact' titlePosition='center' hasBackButton />,
      tabBarIcon: null,
      tabBarVisible: false,
    })
  },
  RequestPayment: {
    screen: props => <PaymentScreen {...props} method='request' />,
    path: '/wallet/request-payment',
    navigationOptions: {
      title: 'Enter amount',
      header: props => <Header {...props} size='compact' titlePosition='center' hasBackButton />,
      tabBarIcon: null,
      tabBarVisible: false,
    }
  },
  SeedWords: {
    screen: props => <SeedWordsScreen {...props} />,
    path: '/settings/seed-words',
    navigationOptions: {
      title: 'Backup',
      header: null,
      tabBarIcon: null,
      tabBarVisible: false,
    }
  },
  TransactionInfo: {
    screen: props => <TransactionInfoScreen {...props} />,
    path: '/wallet/transaction',
    navigationOptions: {
      title: 'Transaction',
      header: props => <Header {...props} size='compact' titlePosition='center' hasBackButton />,
      tabBarIcon: null,
      tabBarVisible: false,
    }
  },
}, {
  initialRouteName: 'MainStack',
  mode: 'modal',
  defaultNavigationOptions: {
    header: null,
  }
});

export default createAppContainer(RootNav);