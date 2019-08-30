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
  headerActions: {
    marginRight: 15,
    flexDirection: 'row',
  },
  content: {
    margin: 15,
  },
  icon: {
    color: colors.black,
  },
  iconButton: {
    marginLeft: 20,
    padding: 14,
    backgroundColor: colors.grey.lightest,
    borderRadius: 50,
  }
});