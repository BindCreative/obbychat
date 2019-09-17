import { StyleSheet, Platform } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { colors } from './../../constants';


export default StyleSheet.create({
  headerNormal: {
    paddingTop: Platform.OS === 'ios' ? getStatusBarHeight() : 0,
    height: Platform.OS === 'ios' ? getStatusBarHeight() + 140 : 140,
    backgroundColor: colors.white,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 15,
  },
  headerCompact: {
    paddingTop: Platform.OS === 'ios' ? getStatusBarHeight() : 0,
    height: Platform.OS === 'ios' ? getStatusBarHeight() + 60 : 60,
    backgroundColor: colors.white,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    marginRight: 20,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontWeight: 'bold',
    color: colors.black,
    fontSize: 32,
  },
  headerTitleSmall: {
    fontSize: 21,
  },
});