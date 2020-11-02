import React from 'react';
import Crypto from 'crypto';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { TouchableOpacity, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import { selectDevicePubKey } from './../../selectors/device';
import { hubAddress, urlHost } from './../../lib/oCustom';
import AddContactIcon from './../../assets/images/icon-person-add.svg';
import ScanIcon from './../../assets/images/icon-scan.svg';
import QRIcon from './../../assets/images/icon-qr.svg';
import styles from './styles';

class ActionsBar extends React.Component {
  constructor(props) {
    super(props);
    this._getPairingCode = this._getPairingCode.bind(this);
  }

  _getPairingCode() {
    const pairingSecret = Crypto.randomBytes(9).toString('base64');
    const pairingCode = `${this.props.devicePubKey}@${hubAddress}#${pairingSecret}`;
    return pairingCode;
  }

  render() {
    return (
      <View style={styles.actionsBar}>
        {/**
        <TouchableOpacity style={styles.iconButton}>
          <AddContactIcon style={styles.icon} width={20} height={20} />
        </TouchableOpacity>
        */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() =>
            this.props.navigation.navigate('QrCode', {
              qrData: this._getPairingCode(),
              type: 'PAIRING_CODE'
            })
          }
        >
          <QRIcon style={styles.icon} width={15} height={15} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => this.props.navigation.navigate('QrScanner', { type: 'DEVICE_INVITATION' })}
        >
          <ScanIcon style={styles.icon} width={15} height={15} />
        </TouchableOpacity>
      </View>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  devicePubKey: selectDevicePubKey(),
});

const mapDispatchToProps = dispatch => ({});

ActionsBar = connect(mapStateToProps, mapDispatchToProps)(ActionsBar);
export default withNavigation(ActionsBar);
