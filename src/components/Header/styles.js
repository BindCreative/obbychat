import { StyleSheet } from 'react-native';
import { colors } from './../../constants';

export default StyleSheet.create({
  headerNormal: {
    paddingTop: 30,
    paddingBottom: 5,
    backgroundColor: colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerCompact: {
    paddingTop: 30,
    paddingBottom: 5,
    backgroundColor: colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerBordered: {
    borderBottomColor: colors.grey.lightest,
    borderBottomWidth: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    marginLeft: 15,
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerCenter: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'flex-end',
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
    paddingTop: 15,
    paddingRight: 15,
    paddingBottom: 15,
  },
});
