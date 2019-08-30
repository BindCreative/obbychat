import { StyleSheet } from 'react-native';
import { colors } from './../../constants';

export default StyleSheet.create({
  header: {
    height: 100,
    backgroundColor: colors.white,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: colors.black,
    fontSize: 32,
    marginLeft: 15,
  },
  content: {
    margin: 15,
  }
});