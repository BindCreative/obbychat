import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { StatusBar, Text, View, ActivityIndicator } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';

import { acceptInvitation } from './../../actions/correspondents';
import Button from './../../components/Button';
import LoadingModal from '../../components/LoadingModal';
import styles from './styles';

import { setToastMessage } from "../../actions/app";
import { REGEX_PAIRING, REGEXP_QR_REQUEST_PAYMENT } from "../../lib/messaging";

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
    const { navigate } = navigation;
    let matches = false;
    console.log(data);
    data
      .replace(REGEX_PAIRING, () => {
        matches = true;
        return dispatch(acceptInvitation({ data }));
      })
      .replace(REGEXP_QR_REQUEST_PAYMENT, (str, payload, walletAddress, amount) => {
        matches = true;
        navigation.pop();
        return navigate('MakePayment', { walletAddress, amount: amount ? +amount.split("=")[1] : '' });
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
