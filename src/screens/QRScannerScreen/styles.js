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
  bottomContent: {
    height: 150,
  },
  loadingContainer: {
    zIndex: 2,
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.white,
  },
});
