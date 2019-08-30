import React from 'react';
import { TouchableOpacity } from 'react-native';
import { View } from 'native-base';
import SendIcon from './../../assets/images/icon-send.svg';
import ScanIcon from './../../assets/images/icon-scan.svg';
import QRIcon from './../../assets/images/icon-qr.svg';
import styles from './styles';


class ActionsBar extends React.Component {
  render() {
    return (
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.iconButton}>
          <SendIcon style={styles.icon} width={20} height={20} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <QRIcon style={styles.icon} width={20} height={20} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <ScanIcon style={styles.icon} width={20} height={20} />
        </TouchableOpacity>
      </View>
    );
  }
}

export default ActionsBar;