import React from 'react';
import {
  createBottomTabNavigator,
} from 'react-navigation';
import ChatStack from './ChatStack';
import WalletStack from './WalletStack';
import SettingsStack from './SettingsStack';
import ChatIcon from './../assets/images/icon-chat-bubble.svg';
import WalletIcon from './../assets/images/icon-wallet.svg';
import MenuIcon from './../assets/images/icon-menu.svg';
import { colors } from '../constants';


const MainStack = createBottomTabNavigator({
  ChatStack: {
    screen: ChatStack,
    navigationOptions: {
      tabBarIcon: ({ focused, tintColor }) => (
        <ChatIcon style={{ color: tintColor }} />
      ),
    }
  },
  WalletStack: {
    screen: WalletStack,
    navigationOptions: {
      tabBarIcon: ({ focused, tintColor }) => (
        <WalletIcon style={{ color: tintColor }} />
      ),
    }
  },
  SettingsStack: {
    screen: SettingsStack,
    navigationOptions: {
      tabBarIcon: ({ focused, tintColor }) => (
        <MenuIcon style={{ color: tintColor }} />
      ),
    }
  },
}, {
  initialRouteName: 'ChatStack',
  defaultNavigationOptions: {
    tabBarVisible: true,
    header: null,
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
  }
});

export default MainStack;