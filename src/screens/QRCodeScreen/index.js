import React, { useEffect } from 'react';
import * as PropTypes from 'prop-types';
import { useDispatch } from "react-redux";
import { View, Platform, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import _ from 'lodash';
import SafeAreaView from 'react-native-safe-area-view';
import Share from 'react-native-share';

import { urlHost } from '../../lib/oCustom';
import { colors } from './../../constants';
import Header from '../../components/Header';
import Button from './../../components/Button';
import styles from './styles';

import { runHceSimulator, stopHceSimulator } from "../../actions/device";

const getTitle = (type) => {
  switch (type) {
    case "PAIRING_CODE": return "Pairing QR code";
    case "WALLET_ADDRESS": return "Wallet QR code";
    default: return "";
  }
};

const QRCodeScreen = ({ navigation, backRoute }) => {
  const dispatch = useDispatch();
  const qrData = _.get(navigation, 'state.params.qrData');
  const type = _.get(navigation, 'state.params.type');
  const title = getTitle(type);
  const shareOptions = Platform.select({
    ios: {
      activityItemSources: [
        {
          placeholderItem: { type: 'text', content: `${urlHost}${qrData}` },
          item: {
            default: { type: 'text', content: `${urlHost}${qrData}` },
            message: null,
          },
          linkMetadata: {
            title: `My Obby chat ${
              type === 'WALLET_ADDRESS' ? 'wallet address' : 'pairing code'
            }`,
          },
        },
      ],
    },
    default: {
      title,
      subject: `My Obby chat ${
        type === 'WALLET_ADDRESS' ? 'wallet address' : 'pairing code'
      }`,
      message: `${urlHost}${qrData}`
    }
  });

  useEffect(
    () => {
      if (Platform.OS === 'android') {
        dispatch(runHceSimulator({ link: `${urlHost}${qrData}` }));
        return () => {
          dispatch(stopHceSimulator());
        };
      }
    },
    []
  );

  return (
    <SafeAreaView
      style={styles.container}
      forceInset={{ top: 'always', bottom: 'always' }}
    >
      <Header
        navigation={navigation}
        title={title}
        size='compact'
        titlePosition='center'
        backRoute={backRoute}
        hasBackButton
      />
      <View style={styles.content}>
        <View style={styles.qrContainer}>
          <QRCode
            value={`${urlHost}${qrData}`}
            size={150}
            bgColor={colors.black}
            fgColor={colors.white}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            text='Share'
            onPress={() => Share.open(shareOptions)}
            style={{ width: 220 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

QRCodeScreen.defaultProps = {
  backRoute: null,
};

QRCodeScreen.propTypes = {
  backRoute: PropTypes.string,
};

export default QRCodeScreen;
