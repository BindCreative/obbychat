import React, { useRef, useCallback } from 'react';
import { View, TouchableOpacity } from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import UserAvatar from 'react-native-user-avatar';
import makeBlockie from 'ethereum-blockies-base64';

import MoreIcon from './../../assets/images/icon-more.svg';
import ReceiveIcon from './../../assets/images/icon-receive.svg';
import SendIcon from './../../assets/images/icon-send.svg';
import styles from './styles';

const ActionsBar = ({
  navigation,
  onRequestPayment,
  onSendPayment,
  onSend,
  address,
  myWalletAddress,
}) => {
  const actionSheet = useRef();

  const handleActionPress = useCallback(
    index => {
      switch (index) {
        case 0:
          onSend([{ text: myWalletAddress }]);
          break;
        default:
      }
    },
    [myWalletAddress, onSend],
  );

  const handleOpenActionSheet = useCallback(() => {
    if (actionSheet) {
      actionSheet.current.show();
    }
  }, []);

  return (
    <View style={styles.actionsBar}>
      <TouchableOpacity
        style={styles.iconButtonSmall}
        onPress={() =>
          navigation.navigate('RequestPayment', {
            walletAddress: myWalletAddress,
            callback: text => {
              onRequestPayment([{ text }]);
            },
          })
        }
      >
        <ReceiveIcon style={styles.icon} width={10} height={10} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconButtonSmall} onPress={onSendPayment}>
        <SendIcon style={styles.icon} width={10} height={10} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.iconButtonSmallTransparent}
        onPress={handleOpenActionSheet}
      >
        <MoreIcon style={styles.icon} width={10} height={10} />
      </TouchableOpacity>
      <ActionSheet
        ref={actionSheet}
        options={[
          'Insert my address',
          //'Insert private profile',
          //'Sign a message',
          //'Offer a smart contract',
          'Cancel',
        ]}
        cancelButtonIndex={1}
        destructiveButtonIndex={1}
        onPress={handleActionPress}
      />
    </View>
  );
};

export default ActionsBar;
