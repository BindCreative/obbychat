import React from 'react';
import { createStackNavigator } from 'react-navigation-stack';
import SettingsScreen from '../screens/SettingsScreen';

const SettingsStack = createStackNavigator(
  {
    Settings: {
      screen: SettingsScreen,
      path: '/settings',
    },
  },
  {
    initialRouteName: 'Settings',
    defaultNavigationOptions: {
      headerShown: false,
    },
  },
);

export default SettingsStack;
