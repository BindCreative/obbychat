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
  addressBox: {
    alignSelf: 'center',
  },
  addressText: {
    color: colors.grey.main,
  },
  field: {
    paddingVertical: 20,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  primaryField: {
    borderColor: colors.grey.lightest,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    marginTop: 40,
  },
  input: {
    padding: 5,
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
    color: colors.black,
    flex: 1,
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
    flex: 1,
  },
  addressInputPaste: {
    marginLeft: 'auto',
    marginRight: 10,
    marginVertical: 10,
  },
  addressInputPasteIcon: {
    marginLeft: 'auto',
  },
  confirmButton: {
    alignSelf: 'center',
    marginTop: 40,
  },
  nfcReaderContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40
  }
});
