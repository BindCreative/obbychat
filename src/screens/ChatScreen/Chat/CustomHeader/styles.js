import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../../constants';

export default StyleSheet.create({
  content: {
    width: '100%',
    backgroundColor: colors.white,
    borderBottomColor: colors.grey.lightest,
    borderBottomWidth: 2,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 30,
    paddingBottom: 5,
    height: 280
  },
  backBtnContainer: {
    marginLeft: 15,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    width: '100%'
  },
  backBtn: {
    marginRight: 10,
    paddingTop: 15,
    paddingRight: 15,
    paddingBottom: 15
  },
  userAvatarContainer: {
    height: 42,
    width: 42,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  userAvatar: {
    width: 70,
    height: 70,
    borderRadius: 40
  },
  userName: {
    marginTop: 16,
    marginBottom: 22,
    fontSize: 20,
    fontWeight: '400'
  }
});
