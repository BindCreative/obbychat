import { StyleSheet } from 'react-native';
import { colors } from './../../constants';

const opacity = 'rgba(33,33,33, .9)';
export default StyleSheet.create({
  backBtn: {
    position: 'relative',
    top: 50,
    marginLeft: 20,
    maxWidth: 24,
    maxHeight: 24,
  },
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  scanner: {
    flex: 1,
    flexDirection: 'column',
  },
  layerTop: {
    flex: 1,
    backgroundColor: opacity,
  },
  layerCenter: {
    flex: 1,
    flexDirection: 'row',
  },
  layerLeft: {
    flex: 1,
    backgroundColor: opacity,
  },
  focused: {
    width: '70%',
    aspectRatio: 1,
  },
  layerRight: {
    flex: 1,
    backgroundColor: opacity,
  },
  layerBottom: {
    flex: 1,
    backgroundColor: opacity,
  },
});
