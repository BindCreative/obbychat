import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../../constants';

export default StyleSheet.create({
  content: {
    width: '100%',
    backgroundColor: colors.white,
    borderBottomColor: colors.grey.main,
    borderBottomWidth: 0.5,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingBottom: 5,
    height: 240
  },
  backBtnContainer: {
    paddingTop: 30,
    paddingLeft: 15,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    width: '100%',
    position: 'absolute'
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
    marginTop: 14,
    marginBottom: 10,
    fontSize: 20,
    fontWeight: '400'
  }
});
