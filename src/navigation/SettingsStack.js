import React from 'react';
import {
  createStackNavigator,
} from 'react-navigation';
import SettingsScreen from '../components/SettingsScreen';


const SettingsStack = createStackNavigator({
  Settings: {
    screen: SettingsScreen,
    path: '/settings',
  },
},{ initialRouteName: 'Settings' });

export default SettingsStack;