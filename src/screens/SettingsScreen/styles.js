import { StyleSheet } from 'react-native';
import { colors } from './../../constants';

export default StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: colors.white,
  },
  userInfo: {
    paddingHorizontal: 15,
    paddingTop: 10,
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
  },
});
