import React from 'react';
import {
  createStackNavigator,
} from 'react-navigation';
import ChatListScreen from '../components/ChatListScreen';
import ChatScreen from '../components/ChatScreen';


const ChatStack = createStackNavigator({
  ChatList: {
    screen: ChatListScreen,
    path: '/chat/list',
  },
  Chat: {
    screen: ChatScreen,
    path: '/chat/contact',
  },
},{
  initialRouteName: 'ChatList',
  defaultNavigationOptions: {
    header: null,
  },
  navigationOptions: ({ navigation }) => ({
    tabBarVisible: ![1, 2].includes(navigation.state.index),
  })
});

export default ChatStack;