import { StyleSheet } from 'react-native';
import { colors } from './../../constants';

export default StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
  content: {
    paddingTop: 15,
    paddingLeft: 15,
    paddingRight: 15,
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
    fontFamily: 'Lato-Bold',
  },
  balanceUnitText: {
    marginLeft: 6,
    fontSize: 22,
    color: colors.grey.main,
    marginBottom: 6,
    fontFamily: 'Lato-Bold',
  },
  convertedBalanceText: {
    fontSize: 26,
    fontFamily: 'Lato-Medium',
    color: colors.cyan.main,
  },
  txHeaderBlock: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 30,
    marginBottom: 15,
  },
  txHeaderText: {
    fontFamily: 'Agenda-Light',
    fontSize: 16,
    color: colors.grey.main,
  },
  txBoxRow: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  txAmount: {
    fontFamily: 'Agenda-Medium',
    fontSize: 22,
    color: colors.black,
  },
  txDate: {
    fontFamily: 'Agenda-Light',
    fontSize: 16,
    color: colors.black,
  },
  txAddress: {
    fontFamily: 'Agenda-Light',
    fontSize: 14,
    color: colors.grey.main,
  },
  txType: {
    fontFamily: 'Agenda-Light',
    fontSize: 16,
    color: colors.black,
    marginBottom: 10,
  },
  transactions: {},
  transaction: {
    borderRadius: 7,
    borderWidth: 3,
    borderColor: colors.grey.lightest,
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
});
