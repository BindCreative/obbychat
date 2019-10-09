import { StyleSheet } from 'react-native';
import { colors } from './../../constants';

export default StyleSheet.create({
  content: {},
  userInfo: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  listItem: {
    borderBottomColor: 'transparent',
  },
  listItemText: {
    fontSize: 20,
  },
  listItemHeader: {
    borderBottomColor: 'transparent'
  },
  listItemHeaderText: {
    fontSize: 16,
    color: colors.grey.main,
  },
  listArrowIcon: {
    color: colors.black,
  }
});