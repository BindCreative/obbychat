import React from 'react';
import PropTypes from 'prop-types';
import QRCode from 'react-native-qrcode';
import { Container, View } from 'native-base';
import { colors } from './../../constants';
import Button from './../Button';
import styles from './styles';


class QRCodeScreen extends React.Component {

  render() {
    return (
      <Container style={styles.container}>
        <View style={styles.qrContainer}>
          <QRCode
            value={this.props.qrData}
            size={220}
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
  qrData: PropTypes.any.isRequired,
  backRoute: PropTypes.string,
};

export default QRCodeScreen;