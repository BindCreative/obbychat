import { StyleSheet } from 'react-native';
import { colors } from '../../constants';

export default StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: colors.white,
    width: '100%',
    height: '100%',
    zIndex: 1000
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    flex: 1,
  },
  logo: {
    width: 150,
    height: 150,
  },
});
