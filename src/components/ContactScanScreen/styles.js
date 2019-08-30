import { StyleSheet } from 'react-native';
import { colors } from './../../constants';


const opacity = 'rgba(0,0,0, .8)';
export default StyleSheet.create({
  container: {
    flex: 1,
  },
  scanner: {
    backgroundColor: colors.black,
    flex: 1,
    flexDirection: 'column'
  },
  layerTop: {
    flex: 1,
    backgroundColor: opacity
  },
  layerCenter: {
    flex: 1,
    flexDirection: 'row'
  },
  layerLeft: {
    flex: 1,
    backgroundColor: opacity
  },
  focused: {
    flex: 2
  },
  layerRight: {
    flex: 1,
    backgroundColor: opacity
  },
  layerBottom: {
    flex: 1,
    backgroundColor: opacity
  },
});