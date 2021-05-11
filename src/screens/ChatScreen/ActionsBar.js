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
  clearChatHistory,
  removeCorrespondent,
  myWalletAddress,
  correspondentWalletAddress,
  correspondentAddress,
  insertAddress,
  onRequestSignMessage
}) => {
  const actionSheet = useRef();

  const handleClearChat = useCallback(() => {
    Alert.alert(
      'Clear chat history',
      'Are you sure?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => clearChatHistory(correspondentAddress),
        },
      ],
      { cancelable: false },
    );
  }, [clearChatHistory, correspondentAddress]);

  const handleDeleteContact = useCallback(() => {
    Alert.alert(
      'Delete contact',
      'Are you sure?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            removeCorrespondent(correspondentAddress);
            navigation.navigate('ChatStack');
          },
        },
      ],
      { cancelable: false },
    );
  }, [correspondentAddress]);

  const handleRequestToSignMessage = useCallback(
    () => {},
    []
  );

  const handleActionPress = useCallback(
    index => {
      switch (index) {
        case 0:
          insertAddress(myWalletAddress);
          break;
        case 1:
          handleClearChat();
          break;
        case 2:
          handleDeleteContact();
          break;
        case 3:
          onRequestSignMessage();
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
      navigation.navigate('MakePayment', {
        walletAddress: correspondentWalletAddress,
      });
    }
  }, [Alert, correspondentWalletAddress, navigation]);

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
          'Clear chat history',
          'Delete contact',
          'Request to Sign a Message',
          'Cancel',
        ]}
        cancelButtonIndex={4}
        destructiveButtonIndex={4}
        onPress={handleActionPress}
      />
    </View>
  );
};

export default ActionsBar;
