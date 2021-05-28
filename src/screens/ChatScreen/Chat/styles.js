import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../constants';

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
  actionsBarCustom: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around'
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
  iconButtonSmallCustom: {
    padding: 20,
    backgroundColor: colors.grey.lightest,
    borderRadius: 50,
    alignSelf: 'center'
  },
  iconButtonTransparent: {
    padding: 14,
    borderRadius: 0,
    alignSelf: 'center',
  },
  iconButtonSmallTransparentCustom: {
    padding: 20,
    borderRadius: 0,
    alignSelf: 'center'
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
  message: {
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 5,
  },
  text: {
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
  url: {
    textDecorationLine: 'underline'
  },
  command: {
    color: colors.blue,
    fontFamily: 'Lato-Regular',
    marginBottom: -3
  },
  outComingCommand: {
    color: colors.lightBlue
  },
  suggestCommand: {
    marginBottom: -5
  },
  dotLineContainer: {
    // position: 'absolute',
    width: '100%',
    height: 1,
    overflow: 'hidden',
    bottom: -2
  },
  dotLine: {
    borderRadius: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.blue,
  },
  outComingDotLine: {
    borderColor: colors.lightBlue
  },
  errorMessageContainer: {
    paddingHorizontal: 8,
    paddingBottom: 4,
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  errorMessage: {
    color: colors.darkRed,
    paddingLeft: 4
  },
  errorImage: {
    color: colors.darkRed
  },
  actionBarButtonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionBarButtonText: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '400'
  },
  textInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    lineHeight: 16,
    marginTop: Platform.select({
      ios: 6,
      android: 0
    }),
    marginBottom: Platform.select({
      ios: 5,
      android: 3
    }),
  },
  linesScrollView: {
    position: 'absolute',
    width: '100%'
  },
  lineText: {
    position: 'absolute',
    fontSize: 16
  }
});
