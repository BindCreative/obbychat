import { StyleSheet } from 'react-native';
import { colors } from './../../constants';

export default StyleSheet.create({
  button: {
    backgroundColor: colors.cyan.main,
    paddingHorizontal: 50,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18
  },
});