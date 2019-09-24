import { StyleSheet, Platform } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { colors } from './../../constants';


export default StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? getStatusBarHeight() : 0,
    minHeight: Platform.OS === 'ios' ? getStatusBarHeight() + 140 : 40,
    margin: 20,
    paddingBottom: 20,
    backgroundColor: colors.white,
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: colors.grey.lightest,
  },
  headerCenter: {
    marginTop: 20,
    marginBottom: 30,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    width: '33.33%',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '33.33%',
  },
  headerRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '33.33%',
  },
  headerTitle: {
    paddingTop: 10,
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitleSmall: {
    marginLeft: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerActionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  icon: {
    color: colors.black,
  },
  iconButton: {
    padding: 14,
    backgroundColor: colors.grey.lightest,
    borderRadius: 50,
    alignSelf: 'center',
  },
  iconButtonSmall: {
    padding: 14,
    backgroundColor: colors.grey.lightest,
    borderRadius: 50,
    alignSelf: 'center',
    marginLeft: 10,
  },
  iconButtonTransparent: {
    padding: 14,
    borderRadius: 0,
    alignSelf: 'center',
  },
  iconButtonSmallTransparent: {
    padding: 14,
    borderRadius: 0,
    alignSelf: 'center',
    marginLeft: 10,
  },
  iconBottomText: {
    fontSize: 12,
    fontWeight: '100',
    alignSelf: 'center',
  }
});