import React from 'react';
import PropTypes from 'prop-types';
import QRCode from 'react-native-qrcode';
import { Container, View, Text } from 'native-base';
import { colors } from './../../constants';
import styles from './styles';


class QRCodeScreen extends React.Component {

  render() {
    return (
      <Container style={styles.container}>
        <QRCode
          value={this.props.qrData}
          size={200}
          bgColor={colors.black}
          fgColor={colors.white}
        />
      </Container>
    );
  }
}

QRCodeScreen.propTypes = {
  qrData: PropTypes.any.isRequired,
};

export default QRCodeScreen;