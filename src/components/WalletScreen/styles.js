import { StyleSheet } from 'react-native';
import { colors } from './../../constants';

export default StyleSheet.create({
  content: {
    margin: 20,
  },
  icon: {
    color: colors.black,
  },
  iconButton: {
    marginLeft: 20,
    padding: 14,
    backgroundColor: colors.grey.lightest,
    borderRadius: 50,
  },
  actionsBar: {
    flexDirection: 'row',
  },
});