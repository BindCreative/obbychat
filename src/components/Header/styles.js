import { StyleSheet, StatusBar } from 'react-native';
import { colors } from './../../constants';


export default StyleSheet.create({
  headerNormal: {
    height: 140,
    backgroundColor: colors.white,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 15,
  },
  headerCompact: {
    height: 60,
    backgroundColor: colors.white,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    marginRight: 15,
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