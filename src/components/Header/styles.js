import { StyleSheet, Dimensions } from 'react-native';
import { colors } from './../../constants';

const screenWidth = Dimensions.get('window').width;

export default StyleSheet.create({
  headerContainer: {
    paddingTop: 30,
    paddingBottom: 5,
    backgroundColor: colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  headerBordered: {
    borderBottomColor: colors.grey.lightest,
    borderBottomWidth: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    marginLeft: 15,
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1
  },
  headerCenter: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 21,
    flex: 1
  },
  backBtn: {
    marginRight: 10,
    paddingTop: 15,
    paddingRight: 15,
    paddingBottom: 15
  },
});
