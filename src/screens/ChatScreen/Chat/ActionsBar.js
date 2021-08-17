import React, { useRef, useCallback } from 'react';
import { Alert, View, TouchableOpacity, Text } from 'react-native';
import { useDispatch } from "react-redux";

import { openPaymentLink } from "../../../actions/wallet";

import MoreIcon from '../../../assets/images/icon-more.svg';
import ReceiveIcon from '../../../assets/images/icon-receive.svg';
import SendIcon from '../../../assets/images/icon-send.svg';
import styles from './styles';

const ActionsBar = ({
  navigation,
  onSend,
  clearChatHistory,
  removeCorrespondent,
  myWalletAddress,
  correspondentWalletAddress,
  correspondentAddress,
  insertAddress,
  onRequestSignMessage,
  customMode,
  handleOpenActionSheet,
  correspondent
}) => {
  const dispatch = useDispatch();

  const handleRequestPayment = useCallback(() => {
    navigation.navigate('RequestPayment', {
      walletAddress: myWalletAddress,
      callback: text => {
        onSend([{ text }]);
      },
    });
  }, [myWalletAddress, navigation]);

  const handleSendPayment = useCallback(() => {
    if (!correspondentWalletAddress) {
      Alert.alert(
        '',
        "You don't know their wallet address yet. Do you want to ask for it?",
        [
          {
            text: 'No',
            style: 'cancel',
          },
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
        ],
        { cancelable: false },
      );
    } else {
      dispatch(openPaymentLink({ walletAddress: correspondentWalletAddress, correspondent }));
    }
  }, [Alert, correspondentWalletAddress, navigation]);

  return (
    <View style={customMode ? styles.actionsBarCustom : styles.actionsBar}>
      <View style={styles.actionBarButtonContainer}>
        <TouchableOpacity
          style={customMode ? styles.iconButtonSmallCustom : styles.iconButtonSmall}
          onPress={handleRequestPayment}
        >
          <ReceiveIcon style={styles.icon} width={customMode ? 15 : 10} height={customMode ? 15 : 10} />
        </TouchableOpacity>
        {customMode && <Text  style={styles.actionBarButtonText}>Request</Text>}
      </View>
      <View style={styles.actionBarButtonContainer}>
        <TouchableOpacity
          style={customMode ? styles.iconButtonSmallCustom : styles.iconButtonSmall}
          onPress={handleSendPayment}
        >
          <SendIcon style={styles.icon} width={customMode ? 15 : 10} height={customMode ? 15 : 10} />
        </TouchableOpacity>
        {customMode && <Text  style={styles.actionBarButtonText}>Send</Text>}
      </View>
      <View style={styles.actionBarButtonContainer}>
        <TouchableOpacity
          style={customMode ? styles.iconButtonSmallTransparentCustom : styles.iconButtonSmallTransparent}
          onPress={handleOpenActionSheet}
        >
          <MoreIcon style={styles.icon} width={customMode ? 15 : 10} height={customMode ? 15 : 10} />
        </TouchableOpacity>
        {customMode && <Text  style={styles.actionBarButtonText}>Others</Text>}
      </View>
    </View>
  );
};

export default ActionsBar;
