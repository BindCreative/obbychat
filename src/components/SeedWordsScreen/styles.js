import { StyleSheet } from 'react-native';
import { colors } from './../../constants';

export default StyleSheet.create({
  content: {
    padding: 20,
    justifyContent: 'space-around',
    backgroundColor: colors.cyan.main,
  },
  buttonArea: {
    width: '100%',
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  nextButton: {
    backgroundColor: colors.white,
  },
  nextButtonText: {
    color: colors.cyan.main,
  },
  prevButton: {
    backgroundColor: colors.white,
  },
  prevButtonText: {
    color: colors.cyan.main,
  },
  helperText: {
    textAlign: 'center',
    color: colors.white,
  },
  wordsText: {
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    color: colors.white,
  },
  stepText: {
    marginBottom: 20,
    fontWeight: 'bold',
    fontSize: 26,
    textAlign: 'center',
    color: colors.white,
  }
});