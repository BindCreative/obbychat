import { StyleSheet } from 'react-native';
import { colors } from './../../constants';

export default StyleSheet.create({
  content: {
    margin: 20,
  },
  icon: {
    color: colors.black,
  },
  iconButton: {
    marginLeft: 20,
    padding: 14,
    backgroundColor: colors.grey.lightest,
    borderRadius: 50,
  },
  actionsBar: {
    flexDirection: 'row',
  },
  balanceRow: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 5,
  },
  balanceText: {
    fontSize: 44,
    color: colors.black,
  },
  balanceUnitText: {
    marginLeft: 6,
    fontSize: 22,
    color: colors.grey.main,
    marginBottom: 6,
    fontWeight: 'bold',
  },
  convertedBalanceText: {
    fontSize: 28,
    color: colors.cyan.main,
  },
});