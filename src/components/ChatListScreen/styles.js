import { StyleSheet } from 'react-native';
import { colors } from '../../constants';

export default StyleSheet.create({
  icon: {
    color: colors.black,
  },
  iconButton: {
    marginLeft: 20,
    padding: 14,
    backgroundColor: colors.grey.lightest,
    borderRadius: 50,
  },
  list: {
    justifyContent: 'flex-start',
    marginLeft: 0,
  },
  listItem: {
    marginLeft: 0,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  listItemBody: {
    borderBottomWidth: 0,
  },
  actionsBar: {
    flexDirection: 'row',
  }
});