import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { StatusBar, Text, View, ActivityIndicator, Alert, Platform } from 'react-native';

import QRCodeScanner from 'react-native-qrcode-scanner';

import { openLink } from "../../actions/device";
import Button from './../../components/Button';
import NfcReader from '../../components/NfcReader';
import LoadingModal from '../../components/LoadingModal';
import styles from './styles';

const QRScannerScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [scanned, setScanned] = useState(false);

  useEffect(
    () => {
      StatusBar.setHidden(true);
      return () => {
        StatusBar.setHidden(false);
      }
    },
    []
  );

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    dispatch(openLink({ link: data }));
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
        <NfcReader />
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
