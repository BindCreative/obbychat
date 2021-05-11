import { StyleSheet } from 'react-native';
import { colors } from '../../constants';

export default StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
  content: {
    paddingHorizontal: 10,
  },
  addressInputBox: {
    marginTop: 50,
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
  addButton: {
    alignSelf: 'center',
    marginTop: 40
  },
  addressInputPaste: {
    marginLeft: 'auto',
    marginRight: 10,
    marginVertical: 10
  },
  addressInputPasteIcon: {
    marginLeft: 'auto',
    color: colors.grey.light
  }
});
