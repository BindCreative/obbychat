import { StyleSheet } from 'react-native';
import { colors } from './../../constants';

export default StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  picker: {
    backgroundColor: 'red',
    width: 30,
    height: 22,
    padding: 0,
    margin: 0,
  },
  label: {
    fontFamily: 'Agenda-Light',
    fontSize: 16,
    marginRight: 10,
    color: colors.grey.main,
  },
});
