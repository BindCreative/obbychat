import { StyleSheet, Platform } from 'react-native';
import { colors } from './../../constants';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },
  actionsBar: {
    flexDirection: 'row',
  },
  header: {
    marginHorizontal: 15,
    marginTop: 15,
    paddingBottom: 15,
    backgroundColor: colors.white,
    justifyContent: 'space-between',
    borderBottomColor: colors.grey.lightest,
    borderBottomWidth: 2,
  },
  headerCompact: {
    marginHorizontal: 15,
    marginTop: 15,
    paddingBottom: 15,
    backgroundColor: colors.white,
    justifyContent: 'space-between',
    flexDirection: 'row',
    borderBottomColor: colors.grey.lightest,
    borderBottomWidth: 2,
  },
  headerCenter: {
    marginBottom: 20,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  headerTitle: {
    paddingTop: 10,
    fontSize: 22,
    fontFamily: 'Agenda-Medium',
    width: '100%',
    textAlign: 'center',
  },
  headerTitleSmall: {
    marginLeft: 20,
    fontSize: 22,
    fontFamily: 'Agenda-Medium',
  },
  headerActionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  headerActionsBarCompact: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  icon: {
    color: colors.black,
  },
  iconButton: {
    padding: 14,
    backgroundColor: colors.grey.lightest,
    borderRadius: 50,
    alignSelf: 'center',
  },
  iconButtonSmall: {
    padding: 14,
    backgroundColor: colors.grey.lightest,
    borderRadius: 50,
    alignSelf: 'center',
    marginLeft: 10,
  },
  iconButtonTransparent: {
    padding: 14,
    borderRadius: 0,
    alignSelf: 'center',
  },
  iconButtonSmallTransparent: {
    padding: 14,
    borderRadius: 0,
    alignSelf: 'center',
    marginLeft: 10,
  },
  iconBottomText: {
    fontSize: 12,
    fontWeight: '100',
    alignSelf: 'center',
  },
  chatArea: {
    backgroundColor: 'red',
  },
  textMessage: {
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 5,
    fontFamily: 'Lato-Regular',
    fontSize: 13,
    color: colors.black,
  },
  actionMessage: {
    fontStyle: 'italic',
  },
  textMessageSent: {
    color: colors.white,
  },
  chatLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blueUrl: {
    color: '#0000EE'
  },
  url: {
    textDecorationLine: 'underline'
  },
  command: {
    color: '#0000EE',
    backgroundColor: 'transparent'
  },
  dotLineContainer: {
    height: 1,
    overflow: 'hidden',
    marginLeft: 10,
    marginRight: 10,
    top: -6
  },
  dotLine: {
    borderRadius: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#0000EE',
  }
});
