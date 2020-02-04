import React from 'react';
import { createStackNavigator } from 'react-navigation-stack';
import ChatListScreen from '../screens/ChatListScreen';

const ChatStack = createStackNavigator(
  {
    ChatList: {
      screen: ChatListScreen,
      path: '/chat/list',
    },
  },
  {
    initialRouteName: 'ChatList',
    defaultNavigationOptions: {
      headerShown: false,
      tabBarVisible: false,
    },
  },
);

export default ChatStack;
