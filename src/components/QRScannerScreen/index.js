import React from 'react';
import PropTypes from 'prop-types';
import { View, SafeAreaView, Text, StatusBar, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import ArrowLeftIcon from './../../assets/images/icon-arrow-left.svg';
import styles from './styles';


class QRScannerScreen extends React.Component {
  static navigationOptions = {
    header: null,
    tabBarVisible: false,
  };

  state = {
    hasCameraPermission: null,
    scanned: false,
  };

  componentDidMount() {
    this._requestCameraPermission();
  }

  _requestCameraPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermission: status === 'granted',
    });
  };

  handleBarCodeScanned = ({ type, data }) => {
    this.setState({ scanned: true });
    this.props.onScanned({ type, data });
  };

  render() {
    const { hasCameraPermission, scanned } = this.state;
    const { tint, intensity } = this.props;

    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    }
    if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    }

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar hidden={true} />
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={styles.scanner}
        >
          <BlurView intensity={intensity} tint={tint} style={styles.layerTop}>
            <TouchableOpacity 
              style={styles.backBtn}
              onPress={() => this.props.navigation.pop()}
            >
              <ArrowLeftIcon color='#ffffff' height={24} width={24} />
            </TouchableOpacity>
          </BlurView>
          <View style={styles.layerCenter}>
            <BlurView style={styles.layerLeft} intensity={intensity} tint={tint} />
            <View style={styles.focused} />
            <BlurView style={styles.layerRight} intensity={intensity} tint={tint} />
          </View>
          <BlurView intensity={intensity} tint={tint} style={styles.layerBottom} />
        </BarCodeScanner>
      </SafeAreaView>
    );
  }
}

QRScannerScreen.defaultProps = {
  tint: 'dark',
  intensity: 80,
};

QRScannerScreen.propTypes = {
  tint: PropTypes.string.isRequired,
  intensity: PropTypes.number.isRequired,
  onScanned: PropTypes.func.isRequired,
};

export default QRScannerScreen;