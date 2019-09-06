import { StyleSheet } from 'react-native';
import { colors } from './../../constants';
import { Button } from 'native-base';
import { bold, red } from 'ansi-colors';


export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: colors.buttonPrimary,
    position: 'absolute',
    bottom: 0,
    width: 250,
    height: 60,
    marginBottom: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
});