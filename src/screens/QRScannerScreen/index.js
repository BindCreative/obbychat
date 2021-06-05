import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { StatusBar, Text, View, ActivityIndicator, Alert, Platform } from 'react-native';

import QRCodeScanner from 'react-native-qrcode-scanner';

import { acceptInvitation } from './../../actions/correspondents';
import { openPaymentLink } from "../../actions/wallet";
import Button from './../../components/Button';
import LoadingModal from '../../components/LoadingModal';
import styles from './styles';

import { setToastMessage } from "../../actions/app";
import { REGEX_PAIRING, REGEXP_QR_REQUEST_PAYMENT } from "../../lib/messaging";

import { runNfcReader, stopNfcReader } from '../../lib/NfcProxy';

const QRScannerScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [scanned, setScanned] = useState(false);

  const readNfcTag = async () => {
    const data = await runNfcReader();
    if (data) {
      handleBarCodeScanned({ data })
    }
    console.log(data);
  };

  useEffect(
    () => {
      if (Platform.OS === 'android') {
        readNfcTag();
      }
      StatusBar.setHidden(true);
      return () => {
        StatusBar.setHidden(false);
        stopNfcReader();
      }
    },
    []
  );

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    let matches = false;
    data
      .replace(REGEX_PAIRING, () => {
        matches = true;
        return dispatch(acceptInvitation({ data }));
      })
      .replace(REGEXP_QR_REQUEST_PAYMENT, (str, payload, walletAddress, query) => {
        matches = true;
        navigation.pop();
        dispatch(openPaymentLink({ walletAddress, query }));
      });

    if (!matches) {
      setScanned(false);
      navigation.pop();
      dispatch(setToastMessage({ type: 'ERROR', message: 'Unsupported qr code' }));
    }
  };

  const handleCancel = () => {
    navigation.pop();
  };

  return (
    <Fragment>
      {scanned && (
        <LoadingModal />
      )}
      <QRCodeScanner
        containerStyle={styles.container}
        cameraStyle={styles.scanner}
        onRead={handleBarCodeScanned}
      />
      <View style={styles.backBtnContainer}>
        {Platform.OS === 'ios' && (
          <Button
            text='Scan link via NFC'
            style={styles.scanBtn}
            onPress={readNfcTag}
          />
        )}
        <Button
          text='Cancel'
          style={styles.backBtn}
          onPress={handleCancel}
        />
      </View>
    </Fragment>
  );
};

QRScannerScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};

export default QRScannerScreen;
