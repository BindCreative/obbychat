import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { TouchableOpacity } from 'react-native';
import { View } from 'native-base';
import { withNavigation } from 'react-navigation';
import { selectCurrentAddress } from './../../selectors/wallet';
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
          <SendIcon 
            style={styles.icon} 
            width={14} 
            height={11}
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() =>  this.props.navigation.navigate('MyWalletQR', {
            qrData: `obbychat:${this.props.currentAddress}`,
          })}
        >
          <QRIcon
            style={styles.icon}
            width={15}
            height={15}
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() =>  this.props.navigation.navigate('WalletScanner')}
        >
          <ScanIcon
            style={styles.icon}
            width={15}
            height={15}
          />
        </TouchableOpacity>
      </View>
    );
  }
}


const mapStateToProps = createStructuredSelector({
  currentAddress: selectCurrentAddress(),
});

const mapDispatchToProps = dispatch => ({});

ActionsBar = connect(mapStateToProps, mapDispatchToProps)(ActionsBar);
export default withNavigation(ActionsBar);