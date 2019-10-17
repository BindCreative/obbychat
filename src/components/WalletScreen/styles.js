import { StyleSheet } from 'react-native';
import { colors } from './../../constants';

export default StyleSheet.create({
  content: {
    margin: 20,
    marginBottom: 0,
  },
  icon: {
    color: colors.black,
  },
  iconButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 24,
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
    fontWeight: 'bold',
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
  txHeaderBlock: {
    marginTop: 30,
    marginBottom: 15,
  },
  txHeaderText: {
    color: colors.grey.main,
  },
  txBoxRow: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  txAmount: {
    fontWeight: 'bold',
    fontSize: 22,
    color: colors.black,
  },
  txDate: {
    fontSize: 16,
    color: colors.black,
  },
  txAddress: {
    fontSize: 14,
    color: colors.grey.main,
  },
  txType: {
    fontSize: 16,
    color: colors.black,
    marginBottom: 20,
  },
  transactions: {},
  transaction: {
    borderRadius: 7,
    borderWidth: 3,
    borderColor: colors.grey.lightest,
    paddingTop: 20,
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 20,
    marginBottom: 15,
  }
});