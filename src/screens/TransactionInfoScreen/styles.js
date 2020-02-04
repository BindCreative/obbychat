import { StyleSheet } from 'react-native';
import { colors } from './../../constants';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    padding: 10,
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
    fontFamily: 'Lato-Bold',
    fontSize: 44,
    paddingVertical: 4,
  },
  primaryUnit: {
    color: colors.grey.main,
    fontFamily: 'Lato-Bold',
    fontSize: 22,
    marginBottom: 8,
  },
  secondaryAmount: {
    color: colors.cyan.main,
    fontFamily: 'Lato-Medium',
    fontSize: 26,
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
    flex: 1,
    width: 100,
    color: colors.grey.main,
    fontFamily: 'Agenda-Light',
    fontSize: 16,
  },
  infoRowValue: {
    flex: 6,
    color: colors.black,
    fontFamily: 'Agenda-Medium',
    fontSize: 16,
    marginLeft: 30,
    flexWrap: 'wrap',
  },
  infoRowValueHL: {
    color: colors.cyan.main,
  },
});
