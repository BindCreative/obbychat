import { StyleSheet } from 'react-native';
import { colors } from '../../constants';

export default StyleSheet.create({
  icon: {
    color: colors.black,
  },
  iconButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 24,
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