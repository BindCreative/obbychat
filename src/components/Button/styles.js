import { StyleSheet } from 'react-native';
import { colors } from './../../constants';

export default StyleSheet.create({
  button: {
    backgroundColor: colors.cyan.main,
    paddingHorizontal: 50,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    borderRadius: 30,
  },
  buttonText: {
    fontFamily: 'Agenda-Medium',
    color: colors.white,
    fontSize: 20,
  },
  disabled: {
    backgroundColor: colors.grey.light
  }
});
