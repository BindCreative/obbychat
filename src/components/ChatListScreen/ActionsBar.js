import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { TouchableOpacity } from 'react-native';
import { View } from 'native-base';
import { withNavigation } from 'react-navigation';
import { selectDeviceAddress } from './../../selectors/wallet';
import AddContactIcon from './../../assets/images/icon-person-add.svg';
import ScanIcon from './../../assets/images/icon-scan.svg';
import QRIcon from './../../assets/images/icon-qr.svg';
import styles from './styles';


class ActionsBar extends React.Component {
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
          onPress={() =>  this.props.navigation.navigate('MyQR', {
            qrData: `obyte-tn:${this.props.deviceAddress}`,
          })}
        >
          <QRIcon style={styles.icon} width={15} height={15} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => this.props.navigation.navigate('ContactScanner')}>
          <ScanIcon style={styles.icon} width={15} height={15} />
        </TouchableOpacity>
      </View>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  deviceAddress: selectDeviceAddress(),
});

const mapDispatchToProps = dispatch => ({});

ActionsBar = connect(mapStateToProps, mapDispatchToProps)(ActionsBar);
export default withNavigation(ActionsBar);