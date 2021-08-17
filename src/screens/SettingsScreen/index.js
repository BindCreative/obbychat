import React, { useMemo } from 'react';
import { connect, useDispatch } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import PropTypes from 'prop-types';
import { View, Text, InteractionManager, Alert, Image, ScrollView } from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import { List, Switch, Divider } from 'react-native-paper';
import ContentLoader, { Circle } from 'react-content-loader/native';
import makeBlockie from 'ethereum-blockies-base64';

import ArrowLeftIcon from '../../assets/images/icon-arrow-left.svg';

import { resetAccount, setDefaultUnitSize, enableNotificationsRequest, disableNotificationsRequest } from "../../actions/device";

import { selectWalletAddress, selectFcmToken } from "../../selectors/temporary";
import { selectUnitSize, selectNotificationsEnabled } from "../../selectors/main";

import ActionSheet from '../../components/ActionSheet';

import { PRIMARY_UNITS, getUnitLabel } from './../../lib/utils';

import styles from './styles';

const SettingsScreen = ({
  navigation, walletAddress, unitSize, notificationsEnabled, fcmToken
}) => {
  const dispatch = useDispatch();

  const handleResetAccount = () => {
    Alert.alert(
      "Warning",
      "Next step will remove all data. Are you sure to continue?",
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => dispatch(resetAccount())
        }
      ]
    );
  };

  const primaryUnit = useMemo(
    () => getUnitLabel(unitSize),
    [unitSize]
  );

  const handleDefaultUnitSelect = unit => dispatch(setDefaultUnitSize(unit));

  const toggleNotificationEnabled = () => {
    if (notificationsEnabled) {
      dispatch(disableNotificationsRequest());
    } else {
      dispatch(enableNotificationsRequest());
    }
  };

  return (
    <SafeAreaView
      style={styles.content}
      forceInset={{ top: 'always', bottom: 'always' }}
    >
      <View style={styles.headerNormal}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      <View style={styles.userInfo}>
        {!!walletAddress && (
          <Image
            style={styles.userAvatar}
            source={{ uri: makeBlockie(walletAddress) }}
          />
        )}
        {!walletAddress &&
        <ContentLoader>
          <Circle cx='32' cy='32' r='32' />
        </ContentLoader>
        }
      </View>
      <View>
        <ScrollView>
          <List.Item
            title="Security"
            titleStyle={styles.listItemHeaderText}
          />
          <List.Item
            title="Recovery words"
            titleStyle={styles.listItemText}
            right={() => <ArrowLeftIcon height={18} width={18} style={styles.listArrowIcon} />}
            onPress={() => navigation.navigate('SeedWords')}
          />
          <List.Item
            title="Restore wallet"
            titleStyle={styles.listItemText}
            right={() => <ArrowLeftIcon height={18} width={18} style={styles.listArrowIcon} />}
            onPress={() => navigation.navigate('RestoreWallet')}
          />
          <List.Item
            title="Display unit size"
            titleStyle={styles.listItemText}
            right={() => (
              <ActionSheet
                currentValue={primaryUnit}
                onChange={handleDefaultUnitSelect}
                items={PRIMARY_UNITS}
              />
            )}
          />
          <List.Item
            title="Enable notifications"
            titleStyle={styles.listItemText}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotificationEnabled}
                disabled={!fcmToken}
              />
            )}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Reset wallet data"
            titleStyle={styles.listItemText}
            onPress={handleResetAccount}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

SettingsScreen.propTypes = {
  fcmToken: PropTypes.string,
  walletAddress: PropTypes.string,
  unitSize: PropTypes.string.isRequired,
  notificationsEnabled: PropTypes.bool.isRequired
};

SettingsScreen.defaultProps = {
  fcmToken: null,
  walletAddress: null
};

const mapStateToProps = createStructuredSelector({
  walletAddress: selectWalletAddress(),
  unitSize: selectUnitSize(),
  notificationsEnabled: selectNotificationsEnabled(),
  fcmToken: selectFcmToken()
});

export default connect(mapStateToProps, null)(SettingsScreen);
