import React, { useRef, useCallback } from 'react';
import { Alert, View, TouchableOpacity } from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import UserAvatar from 'react-native-user-avatar';
import makeBlockie from 'ethereum-blockies-base64';

import MoreIcon from './../../assets/images/icon-more.svg';
import ReceiveIcon from './../../assets/images/icon-receive.svg';
import SendIcon from './../../assets/images/icon-send.svg';
import styles from './styles';

const ActionsBar = ({
  navigation,
  onSend,
  address,
  myWalletAddress,
  correspondentWalletAddress,
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

  const handleRequestPayment = useCallback(() => {
    navigation.navigate('RequestPayment', {
      walletAddress: myWalletAddress,
      callback: text => {
        onSend([{ text }]);
      },
    });
  }, [myWalletAddress, navigation]);

  const handleSendPayment = useCallback(() => {
    // TODO: check if we have their wallet address or request it by sign message
    Alert.alert(
      '',
      "You don't know their wallet address yet. Do you want to ask for it?",
      [
        {
          text: 'Yes',
          onPress: () =>
            onSend([
              {
                text:
                  '[Data request](sign-message-request:Requesting wallet address to send payment)',
              },
            ]),
        },
        {
          text: 'No',
          onPress: () =>
            navigation.navigate('SendPayment', {
              walletAddress: correspondentWalletAddress,
            }),
          style: 'cancel',
        },
      ],
      { cancelable: false },
    );
  }, [Alert]);

  return (
    <View style={styles.actionsBar}>
      <TouchableOpacity
        style={styles.iconButtonSmall}
        onPress={handleRequestPayment}
      >
        <ReceiveIcon style={styles.icon} width={10} height={10} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.iconButtonSmall}
        onPress={handleSendPayment}
      >
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
