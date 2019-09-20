import { StyleSheet } from 'react-native';
import { colors } from '../../constants';


export default StyleSheet.create({
  content: {
    margin: 20,
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
  },
  confirmButton: {
    marginTop: 40,
    alignSelf: 'center'
  }
});