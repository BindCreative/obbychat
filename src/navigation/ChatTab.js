import React from 'react';
import {
  createStackNavigator,
} from 'react-navigation';
import ChatListScreen from '../components/ChatListScreen';
import QRScannerScreen from '../components/QRScannerScreen';
import QRCodeScreen from '../components/QRCodeScreen';
import { colors } from './../constants';


const ChatTab = createStackNavigator({
  Chat: {
    screen: ChatListScreen,
    path: '/chat',
  },
  ContactScanner: {
    screen: props => <QRScannerScreen {...props} onScanned={({ type, data }) => console.log(type, data)} />,
    path: '/chat/contact-scan',
    navigationOptions: {
      header: null,
    },
  },
  MyQR: {
    screen: (props, compProps ) => <QRCodeScreen {...props} {...compProps} qrData={{ foo: 'bar' }} />,
    path: '/chat/my-qr',
    navigationOptions: {
      title: 'My QR code',
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
  initialRouteName: 'Chat',
  navigationOptions: ({ navigation }) => ({
    tabBarVisible: ![1, 2].includes(navigation.state.index),
  })
});

export default ChatTab;