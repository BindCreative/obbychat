import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import PropTypes from 'prop-types';
import { StatusBar, Text, View } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import SafeAreaView from 'react-native-safe-area-view';

import { acceptInvitation } from './../../actions/correspondents';
import Button from './../../components/Button';
import styles from './styles';

class QRScannerScreen extends React.Component {
  constructor(props) {
    super(props);
    this.handleBarCodeScanned = this.handleBarCodeScanned.bind(this);
    this.state = {
      scanned: false,
    };
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
        this.props.acceptInvitation(data);
        return;
      default:
    }
  };

  componentWillUnmount() {
    StatusBar.setHidden(false);
  }

  render() {
    if (this.state.scanned) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    return (
      <QRCodeScanner
        containerStyle={styles.container}
        cameraStyle={styles.scanner}
        onRead={this.handleBarCodeScanned}
        bottomContent={
          <SafeAreaView style={styles.bottomContent}>
            <Button
              text='Cancel'
              style={styles.backBtn}
              onPress={() => this.props.navigation.pop()}
            />
          </SafeAreaView>
        }
      />
    );
  }
}

QRScannerScreen.defaultProps = {
  type: 'WALLET_ADDRESS',
};

QRScannerScreen.propTypes = {
  type: PropTypes.string.isRequired,
};

const mapStateToProps = createStructuredSelector({});

const mapDispatchToProps = dispatch => ({
  acceptInvitation: data => dispatch(acceptInvitation({ data })),
});

QRScannerScreen = connect(mapStateToProps, mapDispatchToProps)(QRScannerScreen);
export default QRScannerScreen;
