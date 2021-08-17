import { StyleSheet } from 'react-native';
import { colors } from "../../constants";

export default StyleSheet.create({
  button: {
    width: 250
  },
  textContainer: {
    width: 250,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderColor: colors.grey.main,
    borderWidth: 1,
    borderRadius: 50
  },
  text: {
    fontSize: 12,
    width: 165
  },
  nfcIcon: {
    marginRight: 12
  }
});
