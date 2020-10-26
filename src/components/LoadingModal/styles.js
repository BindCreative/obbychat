import { StyleSheet } from 'react-native';
import { colors } from './../../constants';

export default StyleSheet.create({
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
    marginTop: 10,
    color: colors.white,
  }
});
