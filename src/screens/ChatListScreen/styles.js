import { StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../constants';

const windowWidth = Dimensions.get('window').width;

export default StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1,
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
  listItem: {
    paddingVertical: 0,
    marginLeft: 0,
    paddingHorizontal: 15,
    height: 50,
    marginVertical: 4
  },
  listItemPreview: {
    fontFamily: 'Agenda-Light',
    flex: 1,
    marginRight: 5
  },
  listItemTitle: {
    fontFamily: 'Agenda-Medium',
    fontSize: 22,
    height: 22,
    lineHeight: 22,
    marginBottom: 4,
    padding: 0,
    color: 'black'
  },
  listItemTime: {
    fontFamily: 'Agenda-Light',
    fontSize: 16,
  },
  userAvatarContainer: {
    height: '100%',
    width: 42,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21
  },
  listItemBody: {
    borderBottomWidth: 0,
  },
  actionsBar: {
    flexDirection: 'row',
  },
  noContactsContainer: {
    flex: 1,
    padding: 10,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  noContactsText: {
    color: colors.grey.main,
    justifyContent: 'center',
    textAlign: 'center',
    fontFamily: 'Agenda-Light',
    fontSize: 16,
  },
  changeNameDialogInput: {
    alignSelf: 'stretch',
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    color: colors.grey.dark,
    height: 40,
    fontSize: 15,
    backgroundColor: colors.grey.lightest,
    textAlign: 'center',
  },
  descriptionContainer: {
    flexDirection: 'row',
    opacity: 0.4,
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    height: 16,
    fontSize: 16,
    lineHeight: 16
  },
  dividerView: {
    height: 24
  },
  divider: {
    margin: 12
  },
  dividerText: {
    position: 'absolute',
    textAlign: 'center',
    lineHeight: 24,
    backgroundColor: colors.white,
    width: 100,
    left: windowWidth / 2 - 50,
    color: colors.grey.main
  }
});
