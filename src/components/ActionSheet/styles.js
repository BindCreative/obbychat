import { StyleSheet } from 'react-native';
import { colors } from './../../constants';

export default StyleSheet.create({
  container: {
    alignContent: 'flex-end',
    justifyContent: 'center'
  },
  label: {
    fontFamily: 'Agenda-Light',
    fontSize: 16,
    marginRight: 10,
    color: colors.grey.main,
  },
});
