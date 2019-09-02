import React from 'react';
import {
  createStackNavigator,
} from 'react-navigation';
import ChatListScreen from '../components/ChatListScreen';
import QRScanner from '../components/QRScanner';


const ChatTab = createStackNavigator({
  Chat: {
    screen: ChatListScreen,
    path: '/chat',
  },
  ContactScanner: {
    screen: props => <QRScanner {...props} onScanned={({ type, data }) => console.log(type, data)} />,
    path: '/chat/contact-scan',
    navigationOptions: {
      header: null,
    },
  },
},{
  initialRouteName: 'Chat',
  navigationOptions: ({ navigation }) => ({
    tabBarVisible: navigation.state.index !== 1,
  })
});

export default ChatTab;