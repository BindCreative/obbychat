import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import MainStack from './MainStack';
import QRScannerScreen from '../screens/QRScannerScreen';
import QRCodeScreen from '../screens/QRCodeScreen';
import PaymentScreen, { Methods } from './../screens/PaymentScreen';
import SeedWordsScreen from './../screens/SeedWordsScreen';
import TransactionInfoScreen from './../screens/TransactionInfoScreen';
import ChatScreen from '../screens/ChatScreen';

const RootNav = createStackNavigator(
  {
    MainStack: {
      screen: MainStack,
    },
    Chat: {
      screen: ChatScreen,
      path: '/chat/contact',
    },
    ContactScanner: {
      screen: props => (
        <QRScannerScreen
          {...props}
          type='DEVICE_INVITATION'
          backRoute='ChatStack'
        />
      ),
      path: '/chat/scan',
    },
    MyQR: {
      screen: (props, compProps) => (
        <QRCodeScreen
          {...props}
          {...compProps}
          title='Pairing QR code'
          backRoute='ChatStack'
        />
      ),
      path: '/chat/my-qr',
    },
    WalletScanner: {
      screen: props => (
        <QRScannerScreen
          {...props}
          type='WALLET_ADDRESS'
          backRoute='WalletStack'
        />
      ),
      path: '/wallet/scan',
    },
    MyWalletQR: {
      screen: (props, compProps) => (
        <QRCodeScreen
          {...props}
          {...compProps}
          title='Wallet QR code'
          backRoute='WalletStack'
        />
      ),
      path: '/wallet/my-qr',
    },
    MakePayment: {
      screen: props => <PaymentScreen {...props} method={Methods.SEND} />,
      path: '/wallet/make-payment',
      navigationOptions: ({ navigation }) => ({
        tabBarIcon: null,
        tabBarVisible: false,
      }),
    },
    RequestPayment: {
      screen: props => <PaymentScreen {...props} method={Methods.REQUEST} />,
      path: '/wallet/request-payment',
      navigationOptions: {
        tabBarIcon: null,
        tabBarVisible: false,
      },
    },
    SeedWords: {
      screen: props => <SeedWordsScreen {...props} />,
      path: '/settings/seed-words',
      navigationOptions: {
        headerShown: false,
        tabBarIcon: null,
        tabBarVisible: false,
      },
    },
    TransactionInfo: {
      screen: props => <TransactionInfoScreen {...props} />,
      path: '/wallet/transaction',
      navigationOptions: {
        tabBarIcon: null,
        tabBarVisible: false,
      },
    },
  },
  {
    initialRouteName: 'MainStack',
    mode: 'modal',
    defaultNavigationOptions: {
      headerShown: false,
    },
  },
);

export default createAppContainer(RootNav);
