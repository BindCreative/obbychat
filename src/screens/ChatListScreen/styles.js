import { StyleSheet } from 'react-native';
import { colors } from '../../constants';

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
  list: {
    justifyContent: 'flex-start',
    marginLeft: 0,
  },
  listItem: {
    marginLeft: 0,
    paddingHorizontal: 15,
  },
  listItemPreview: {
    fontFamily: 'Agenda-Light',
    fontSize: 16,
  },
  listItemTitle: {
    fontFamily: 'Agenda-Medium',
    fontSize: 22,
    marginBottom: 4,
  },
  listItemTime: {
    fontFamily: 'Agenda-Light',
    fontSize: 16,
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
});
