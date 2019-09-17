import React from 'react';
import {
  createStackNavigator,
} from 'react-navigation';
import ChatListScreen from '../components/ChatListScreen';
import QRScannerScreen from '../components/QRScannerScreen';
import QRCodeScreen from '../components/QRCodeScreen';
import ChatScreen from '../components/ChatScreen';
import Header from '../components/Header';
import { colors } from './../constants';


const ChatTab = createStackNavigator({
  List: {
    screen: ChatListScreen,
    path: '/chat/list',
  },
  ContactScanner: {
    screen: props => <QRScannerScreen {...props} onScanned={({ type, data }) => console.log(type, data)} />,
    path: '/chat/scan',
    navigationOptions: {
      header: null,
      transitionConfig: {
        isModal: true,
      },
    },
  },
  MyQR: {
    screen: (props, compProps ) => <QRCodeScreen {...props} {...compProps} qrData={{ foo: 'bar' }} />,
    path: '/chat/my-qr',
    navigationOptions: {
      title: 'My QR code',
      header: props => <Header {...props} hasBackButton={true} titlePosition='center' size='compact' />,
      transitionConfig: {
        isModal: true,
      },
    },
  },
  ContactChat: {
    screen: ChatScreen,
    path: '/chat/contact',
    navigationOptions: {
      header: null,
    },
  },
},{
  initialRouteName: 'List',
  navigationOptions: ({ navigation }) => ({
    tabBarVisible: ![1, 2].includes(navigation.state.index),
  })
});

export default ChatTab;