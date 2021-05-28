import React, { Fragment, useCallback, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';

import makeBlockie from 'ethereum-blockies-base64';
import { withStyle, View, Image, Animated, Text, TouchableOpacity, Alert } from 'react-native';

import ActionSheet from 'react-native-actionsheet';

import ActionsBar from '../ActionsBar';
import Header from '../../../../components/Header';

import ArrowLeftIcon from '../../../../assets/images/icon-arrow-left.svg';

import styles from './styles';
import {colors} from "../../../../constants";

const CustomHeader = ({
  correspondent, navigation, keyboardOpen, backRoute, myWalletAddress, onClearChatHistory, onRemoveCorespondent, onSend,
  onRequestSignMessage, insertAddress, correspondentWalletAddress
}) => {
  const actionSheet = useRef();

  const correspondentAddress = useMemo(
    () => correspondent.address,
    [correspondent]
  );

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
          onPress: () => onClearChatHistory(correspondentAddress),
        },
      ],
      { cancelable: false },
    );
  }, [onClearChatHistory, correspondentAddress]);

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
            onRemoveCorespondent(correspondentAddress);
            navigation.navigate('ChatStack');
          },
        },
      ],
      { cancelable: false },
    );
  }, [correspondentAddress]);

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

  const renderActionBar = () => (
    <ActionsBar
      navigation={navigation}
      myWalletAddress={myWalletAddress}
      clearChatHistory={onClearChatHistory}
      removeCorrespondent={onRemoveCorespondent}
      onSend={onSend}
      onRequestSignMessage={onRequestSignMessage}
      insertAddress={insertAddress}
      correspondentWalletAddress={correspondentWalletAddress}
      correspondentAddress={correspondent.address}
      customMode={!keyboardOpen}
      handleOpenActionSheet={handleOpenActionSheet}
    />
  );

  return (
    <Fragment>
      {keyboardOpen
        ? (
          <Header
            hasBackButton
            hasBorder
            backRoute={backRoute}
            size='compact'
            titlePosition='left'
            title={correspondent.name}
            navigation={navigation}
            right={renderActionBar()}
          />
        )
        : (
          <View style={styles.content}>
            <View style={styles.backBtnContainer}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => backRoute ? navigation.navigate(backRoute) : navigation.pop()}
              >
                <ArrowLeftIcon color={colors.black} height={18} width={18} />
              </TouchableOpacity>
            </View>
            <View style={styles.userAvatarContainer}>
              <Image
                style={styles.userAvatar}
                name={correspondent.name}
                source={{ uri: makeBlockie(correspondent.address) }}
              />
            </View>
            <Text style={styles.userName}>{correspondent.name}</Text>
            {renderActionBar()}
          </View>
        )}
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
    </Fragment>
  )
};

CustomHeader.propTypes = {
  correspondent: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  keyboardOpen: PropTypes.bool.isRequired
};

export default CustomHeader;
