import { StyleSheet } from 'react-native';
import { colors } from './../../constants';

export default StyleSheet.create({
  headerNormal: {
    paddingHorizontal: 15,
    paddingTop: 30,
    paddingBottom: 5,
    backgroundColor: colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: 'Agenda-Medium',
    color: colors.black,
    fontSize: 28,
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
  },
  userInfo: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  userAvatarContainer: {
    width: 62,
    height: 64
  },
  listItem: {
    borderBottomColor: 'transparent',
  },
  listItemText: {
    fontFamily: 'Agenda-Medium',
    fontSize: 22,
  },
  listItemHeader: {
    borderBottomColor: 'transparent',
  },
  listItemHeaderText: {
    fontFamily: 'Agenda-Light',
    fontSize: 16,
    color: colors.grey.main,
  },
  listArrowIcon: {
    color: colors.black,
    transform: [{
      rotate: '180deg'
    }]
  },
});
