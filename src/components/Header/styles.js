import { StyleSheet } from 'react-native';
import { colors } from './../../constants';

export default StyleSheet.create({
  headerNormal: {
    paddingTop: 30,
    paddingBottom: 5,
    backgroundColor: colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  headerCompact: {
    paddingTop: 30,
    paddingBottom: 5,
    backgroundColor: colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  headerBordered: {
    borderBottomColor: colors.grey.lightest,
    borderBottomWidth: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    marginLeft: 15,
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
  },
  headerCenter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Agenda-Medium',
    color: colors.black,
    fontSize: 28,
  },
  headerTitleSmall: {
    fontSize: 21,
  },
  backBtn: {
    marginRight: 10,
  },
});
