import { StyleSheet, Dimensions } from 'react-native';
import { colors } from './../../constants';

const screenWidth = Dimensions.get('window').width;

export default StyleSheet.create({
  headerContainer: {
    paddingTop: 30,
    paddingBottom: 5,
    backgroundColor: colors.white,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'nowrap'
  },
  headerBordered: {
    borderBottomColor: colors.grey.lightest,
    borderBottomWidth: 2,
  },
  headerLeft: {
    marginLeft: 15,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center'
  },
  headerCenter: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  headerRight: {
    flexDirection: 'row',
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  headerTitle: {
    fontFamily: 'Agenda-Medium',
    color: colors.black,
    fontSize: 28
  },
  headerTitleSmall: {
    fontSize: 21
  },
  backBtn: {
    marginRight: 10,
    paddingTop: 15,
    paddingRight: 15,
    paddingBottom: 15
  },
});
