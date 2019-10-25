import { StyleSheet } from 'react-native';
import { colors } from './../../constants';

export default StyleSheet.create({
  container: {
    backgroundColor: colors.white,
  },
  content: {
    padding: 20,
  },
  amountBlock: {
    paddingTop: 40,
    paddingBottom: 60,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  primaryAmount: {
    color: colors.black,
    fontWeight: 'bold',
    fontSize: 44,
    paddingVertical: 4,
  },
  primaryUnit: {
    color: colors.grey.main,
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 6,
    marginLeft: 6,
  },
  secondaryAmount: {
    color: colors.cyan.main,
    fontWeight: '500',
    fontSize: 26,
    paddingVertical: 3,
  },
  infoBlock: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
  },
  infoRowLabel: {
    color: colors.grey.main,
    fontSize: 16,
  },
  infoRowValue: {
    color: colors.black,
    fontSize: 16,
    marginLeft: 30,
  },
  infoRowValueHL: {
    color: colors.cyan.main,
  },
});