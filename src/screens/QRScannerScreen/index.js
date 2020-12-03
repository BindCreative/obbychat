import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { StatusBar, Text, View, ActivityIndicator } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import _ from 'lodash';

import { acceptInvitation } from './../../actions/correspondents';
import Button from './../../components/Button';
import LoadingModal from '../../components/LoadingModal';
import styles from './styles';
import { colors } from './../../constants';

class QRScannerScreen extends React.Component {
  constructor(props) {
    super(props);
    this.handleBarCodeScanned = this.handleBarCodeScanned.bind(this);
    this.state = {
      scanned: false
    };
  }

  componentDidMount() {
    StatusBar.setHidden(true);
  }

  handleBarCodeScanned = ({ data }) => {
    const type = _.get(this.props.navigation, 'state.params.type');
    switch (type) {
      case 'WALLET_ADDRESS':
        return this.props.navigation.navigate('MakePayment', {
          walletAddress: data.replace(/^.*:/, ''),
        });
      case 'DEVICE_INVITATION':
        this.setState({ scanned: true });
        setTimeout(() => this.props.acceptInvitation(data), 0);
        return;
      default:
        this.setState({ scanned: false });
    }
  };

  componentWillUnmount() {
    StatusBar.setHidden(false);
  }

  render() {
    return (
      <Fragment>
        {this.state.scanned && (
          <LoadingModal />
        )}
        <QRCodeScanner
          containerStyle={styles.container}
          cameraStyle={styles.scanner}
          onRead={this.handleBarCodeScanned}
        />
        <View style={styles.backBtnContainer}>
          <Button
            text='Cancel'
            style={styles.backBtn}
            onPress={() => this.props.navigation.pop()}
          />
        </View>
      </Fragment>
    );
  }
}

const mapStateToProps = createStructuredSelector({});

const mapDispatchToProps = dispatch => ({
  acceptInvitation: data => dispatch(acceptInvitation({ data })),
});

QRScannerScreen = connect(mapStateToProps, mapDispatchToProps)(QRScannerScreen);
export default QRScannerScreen;
