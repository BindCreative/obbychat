import { StyleSheet, Dimensions } from 'react-native';
import { colors } from './../../constants';

const screenWidth = Dimensions.get('window').width;

export default StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1
  },
  content: {
    backgroundColor: colors.white,
    flex: 1,
    padding: 10,
    justifyContent: 'center'
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
  },
  wordInput: {
    padding: 5,
    fontSize: 24,
    backgroundColor: 'transparent',
    color: colors.black,
    flex: 1
  },
  wordInputBox: {
    paddingVertical: 6,
    justifyContent: 'space-between',
    flexDirection: 'row',
    borderColor: colors.cyan.main,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    marginVertical: 20
  },
  autocompleteContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingVertical: 6,
    height: 68
  },
  autocompleteVariant: {
    color: colors.black,
    width: (screenWidth - 50) / 3,
    height: 20,
    margin: 4
  },
  autocompleteVariantText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    textDecorationLine: 'underline',
    textDecorationColor: colors.cyan.main
  },
  autocompleteNoMatchText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center'
  },
  stepWordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingVertical: 6,
    height: 40
  },
  stepWordsVariant: {
    color: colors.black,
    width: (screenWidth - 50) / 3,
    height: 20,
    margin: 4
  },
  stepWordsVariantText: {
    fontSize: 16,
    lineHeight: 20,
    textAlign: 'center',
    textDecorationLine: 'underline'
  },
  addressInputBox: {
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.grey.lightest,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressInput: {
    padding: 10,
    fontSize: 18,
    color: colors.black,
    backgroundColor: 'transparent',
    flex: 1
  },
  addressInputPaste: {
    marginLeft: 'auto',
    marginRight: 10,
    marginVertical: 10
  },
  addressInputPasteIcon: {
    marginLeft: 'auto'
  }
});
