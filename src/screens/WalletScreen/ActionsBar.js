import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { TouchableOpacity, View } from 'react-native';
import { withNavigation } from 'react-navigation';

import { selectWalletAddress } from "../../selectors/temporary";

import SendIcon from './../../assets/images/icon-send.svg';
import ScanIcon from './../../assets/images/icon-scan.svg';
import QRIcon from './../../assets/images/icon-qr.svg';

import styles from './styles';

class ActionsBar extends React.Component {
  render() {
    return (
      <View style={styles.actionsBar}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => this.props.navigation.navigate('MakePayment')}
        >
          <SendIcon style={styles.icon} width={14} height={11} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() =>
            this.props.navigation.navigate('QrCode', {
              qrData: this.props.walletAddress,
              type: 'WALLET_ADDRESS'
            })
          }
        >
          <QRIcon style={styles.icon} width={15} height={15} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => this.props.navigation.navigate('QrScanner', { type: 'WALLET_ADDRESS' })}
        >
          <ScanIcon style={styles.icon} width={15} height={15} />
        </TouchableOpacity>
      </View>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  walletAddress: selectWalletAddress(),
});

const mapDispatchToProps = dispatch => ({});

ActionsBar = connect(mapStateToProps, mapDispatchToProps)(ActionsBar);
export default withNavigation(ActionsBar);
