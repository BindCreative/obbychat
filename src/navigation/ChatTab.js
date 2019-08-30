import React from 'react';
import {
  createStackNavigator,
} from 'react-navigation';
import ChatListScreen from '../components/ChatListScreen';
import ContactScanScreen from '../components/ContactScanScreen';


const ChatTab = createStackNavigator({
  Chat: {
    screen: ChatListScreen,
    path: '/chat',
  },
  ContactScanner: {
    screen: ContactScanScreen,
    path: '/chat/contact-scan',
  },
},{
  initialRouteName: 'Chat',
  navigationOptions: ({ navigation }) => ({
    tabBarVisible: navigation.state.index !== 1,
  })
});

export default ChatTab;