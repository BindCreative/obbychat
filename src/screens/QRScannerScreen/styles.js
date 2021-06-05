import { StyleSheet } from 'react-native';
import { colors } from './../../constants';

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  scanner: {
    flex: 1,
  },
  backBtnContainer: {
    position: 'absolute',
    bottom: 50,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
    width: '100%'
  },
  backBtn: {
    width: 250
  },
  scanBtn: {
    marginBottom: 12,
    width: 250
  }
});
