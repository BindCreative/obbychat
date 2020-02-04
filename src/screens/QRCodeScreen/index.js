import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import _ from 'lodash';
import SafeAreaView from 'react-native-safe-area-view';

import { colors } from './../../constants';
import Header from '../../components/Header';
import Button from './../../components/Button';
import styles from './styles';

const QRCodeScreen = ({ navigation, backRoute, title }) => {
  const qrData = _.get(navigation, 'state.params.qrData');
  console.log('MY QR: ', qrData);

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
            value={qrData}
            size={150}
            bgColor={colors.black}
            fgColor={colors.white}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            text='Done'
            onPress={() => navigation.navigate(backRoute)}
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
