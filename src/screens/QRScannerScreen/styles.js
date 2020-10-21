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
    width: 175
  }
});
