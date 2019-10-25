import React from 'react';
import PropTypes from 'prop-types';
import QRCode from 'react-native-qrcode';
import _ from 'lodash';
import { Container, View } from 'native-base';
import { colors } from './../../constants';
import Button from './../Button';
import styles from './styles';


class QRCodeScreen extends React.Component {

  render() {
    const qrData = _.get(this.props, 'navigation.state.params.qrData');
    if (!qrData) {
      alert('Invalid QR data!');
    }

    return (
      <Container style={styles.container}>
        <View style={styles.qrContainer}>
          <QRCode
            value={qrData}
            size={160}
            bgColor={colors.black}
            fgColor={colors.white}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button text='Done' onPress={() => this.props.navigation.navigate(this.props.backRoute)} style={{ width: 220 }} />
        </View>
      </Container>
    );
  }
}

QRCodeScreen.defaultProps = {
  backRoute: null,
};

QRCodeScreen.propTypes = {
  backRoute: PropTypes.string,
};

export default QRCodeScreen;