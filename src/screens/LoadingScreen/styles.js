import { StyleSheet } from 'react-native';
import { colors } from '../../constants';

export default StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1,
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
