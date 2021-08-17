import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../constants';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    padding: 12,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between'
  }
});
