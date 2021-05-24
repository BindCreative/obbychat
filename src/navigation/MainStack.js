import React from 'react';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import ChatIcon from './../assets/images/icon-chat-bubble.svg';
import WalletIcon from './../assets/images/icon-wallet.svg';
import MenuIcon from './../assets/images/icon-menu.svg';

import SettingsScreen from '../screens/SettingsScreen';
import ChatListScreen from '../screens/ChatListScreen';
import WalletScreen from '../screens/WalletScreen';

import { colors } from '../constants';

const MainStack = createBottomTabNavigator(
  {
    ChatStack: {
      path: 'chat/:pairingId',
      screen: ChatListScreen,
      navigationOptions: {
        tabBarIcon: ({ focused, tintColor }) => (
          <ChatIcon style={{ color: tintColor }} />
        ),
      },
    },
    WalletStack: {
      path: 'wallet',
      screen: WalletScreen,
      navigationOptions: {
        tabBarIcon: ({ focused, tintColor }) => (
          <WalletIcon style={{ color: tintColor }} />
        ),
      },
    },
    SettingsStack: {
      path: 'settings',
      screen: SettingsScreen,
      navigationOptions: {
        tabBarIcon: ({ focused, tintColor }) => (
          <MenuIcon style={{ color: tintColor }} />
        ),
      },
    },
  },
  {
    initialRouteName: 'ChatStack',
    lazy: false,
    defaultNavigationOptions: {
      tabBarVisible: true,
    },
    tabBarOptions: {
      showIcon: true,
      showLabel: false,
      activeTintColor: colors.cyan.main,
      inactiveTintColor: colors.black,
      tabStyle: {
        maxWidth: 72,
      },
      style: {
        height: 58,
        justifyContent: 'center',
        alignContent: 'center',
        borderTopColor: colors.white,
        backgroundColor: colors.white,
        //ios
        shadowOpacity: 0.3,
        shadowRadius: 3,
        shadowOffset: {
          height: 0,
          width: 0,
        },
        //android
        elevation: 24,
      },
    },
  },
);

export default MainStack;
