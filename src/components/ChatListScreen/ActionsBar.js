import React from 'react';
import { TouchableOpacity } from 'react-native';
import { View } from 'native-base';
import { withNavigation } from 'react-navigation';
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
        <TouchableOpacity style={styles.iconButton} onPress={() => this.props.navigation.navigate('MyQR')}>
          <QRIcon style={styles.icon} width={20} height={20} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => this.props.navigation.navigate('ContactScanner')}>
          <ScanIcon style={styles.icon} width={20} height={20} />
        </TouchableOpacity>
      </View>
    );
  }
}

export default withNavigation(ActionsBar);