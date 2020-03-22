import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import PropTypes from 'prop-types';
import { StatusBar, TouchableOpacity, View, Linking } from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { BlurView } from 'react-native-unimodules';
import * as Permissions from 'expo-permissions';

import { acceptInvitation } from './../../actions/correspondents';
import ArrowLeftIcon from './../../assets/images/icon-arrow-left.svg';
import styles from './styles';

class QRScannerScreen extends React.Component {
  constructor(props) {
    super(props);
    this.handleBarCodeScanned = this.handleBarCodeScanned.bind(this);
  }

  componentDidMount() {
    StatusBar.setHidden(true);
  }

  handleBarCodeScanned = ({ data }) => {
    switch (this.props.type) {
      case 'WALLET_ADDRESS':
        return this.props.navigation.navigate('MakePayment', {
          walletAddress: data.replace(/^.*:/, ''),
        });
      case 'DEVICE_INVITATION':
        console.log(123, data);
        this.props.acceptInvitation(data);
        return;
      default:
    }
  };

  componentWillUnmount() {
    StatusBar.setHidden(false);
  }

  render() {
    const { tint, intensity } = this.props;

    // TODO: implement qr scanner component
    return (
      <View style={styles.container}>
        <QRCodeScanner
          onRead={this.handleBarCodeScanned}
          style={styles.scanner}
        >
          <BlurView intensity={intensity} tint={tint} style={styles.layerTop}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => this.props.navigation.pop()}
            >
              <ArrowLeftIcon color='#ffffff' height={18} width={18} />
            </TouchableOpacity>
          </BlurView>
          <View style={styles.layerCenter}>
            <BlurView
              style={styles.layerLeft}
              intensity={intensity}
              tint={tint}
            />
            <View style={styles.focused} />
            <BlurView
              style={styles.layerRight}
              intensity={intensity}
              tint={tint}
            />
          </View>
          <BlurView
            intensity={intensity}
            tint={tint}
            style={styles.layerBottom}
          />
        </QRCodeScanner>
      </View>
    );
  }
}

QRScannerScreen.defaultProps = {
  type: 'WALLET_ADDRESS',
  tint: 'dark',
  intensity: 80,
};

QRScannerScreen.propTypes = {
  type: PropTypes.string.isRequired,
  tint: PropTypes.string.isRequired,
  intensity: PropTypes.number.isRequired,
};

const mapStateToProps = createStructuredSelector({});

const mapDispatchToProps = dispatch => ({
  acceptInvitation: data => dispatch(acceptInvitation({ data })),
});

QRScannerScreen = connect(mapStateToProps, mapDispatchToProps)(QRScannerScreen);
export default QRScannerScreen;
