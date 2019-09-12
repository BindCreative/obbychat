import React from 'react';
import {
  createBottomTabNavigator,
  createAppContainer,
} from 'react-navigation';
import ChatTab from './ChatTab';
import WalletTab from './WalletTab';
import SettingsTab from './SettingsTab';
import { colors } from './../constants';
import ChatIcon from './../assets/images/icon-chat-bubble.svg';
import WalletIcon from './../assets/images/icon-wallet.svg';
import MenuIcon from './../assets/images/icon-menu.svg';


const MainStackNav = createBottomTabNavigator({
  ChatStack: {
    screen: ChatTab,
    navigationOptions: {
      tabBarIcon: ({ focused, tintColor }) => (
        <ChatIcon style={{ color: tintColor }} />
      ),
    }
  },
  WalletStack: {
    screen: WalletTab,
    navigationOptions: {
      tabBarIcon: ({ focused, tintColor }) => (
        <WalletIcon style={{ color: tintColor }} />
      ),
    }
  },
  SettingsStack: {
    screen: SettingsTab,
    navigationOptions: {
      tabBarIcon: ({ focused, tintColor }) => (
        <MenuIcon style={{ color: tintColor }} />
      ),
    }
  },
}, {
  initialRouteName: 'ChatStack',
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

const Navigator = MainStackNav;

export default createAppContainer(Navigator);