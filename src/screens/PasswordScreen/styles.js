import { StyleSheet } from 'react-native';
import { colors } from '../../constants';

export default StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: colors.white,
    width: '100%',
    height: '100%',
    zIndex: 1001
  },
  content: {
    paddingHorizontal: 30,
    flex: 1,
    justifyContent: 'center'
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
    marginLeft: 'auto'
  },
  titleContainer: {
    alignItems: 'center',
    flexWrap: 'nowrap',
    flexDirection: 'row'
  },
  titleText: {
    marginLeft: 8
  },
  descriptionContainer: {
    marginVertical: 30
  }
});
