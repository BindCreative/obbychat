import { StyleSheet } from 'react-native';
import { colors } from './../../constants';

export default StyleSheet.create({
  content: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-around',
    backgroundColor: colors.white,
  },
  buttonArea: {
    width: '100%',
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    flexWrap: 'wrap'
  },
  nextButton: {
    backgroundColor: colors.cyan.main,
  },
  nextButtonText: {
    color: colors.white,
  },
  prevButton: {
    backgroundColor: colors.cyan.main,
  },
  prevButtonText: {
    color: colors.white,
  },
  helperText: {
    fontFamily: 'Agenda-Light',
    textAlign: 'center',
    color: colors.black,
    fontSize: 20,
  },
  wordsText: {
    fontFamily: 'Agenda-Light',
    fontSize: 20,
    textAlign: 'center',
    color: colors.black,
  },
  stepText: {
    marginBottom: 20,
    fontFamily: 'Agenda-Light',
    fontSize: 26,
    textAlign: 'center',
    color: colors.black,
  },
  skipButton: {
    width: '100%',
    marginTop: 20
  }
});
