import React from 'react';
import {
  createStackNavigator,
} from 'react-navigation';
import SettingsScreen from '../components/SettingsScreen';


const SettingsTab = createStackNavigator({
  Settings: {
    screen: SettingsScreen,
    path: 'settings',
  },
},{ initialRouteName: 'Settings' });

export default SettingsTab;