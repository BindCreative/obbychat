import React, { useState, useMemo, Fragment } from 'react';
import { connect, useDispatch } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { TouchableOpacity, Text, Clipboard, Alert, View, Linking } from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import { GiftedChat } from 'react-native-gifted-chat';
import _ from 'lodash';

import styles from './styles';
import { signMessage, fromWif } from 'obyte/lib/utils';
import { parseTextMessage } from '../../lib/messaging';
import { addMessageStart, removeMessage } from '../../actions/messages';
import { setToastMessage } from '../../actions/app';
import {
  clearChatHistory,
  removeCorrespondent,
} from '../../actions/correspondents';
import { selectCorrespondentMessages, selectCorrespondentWalletAddress } from '../../selectors/messages';
import { selectWalletAddress, selectAddressWif } from '../../selectors/wallet';
import ActionsBar from './ActionsBar';
import Header from '../../components/Header';
import { testnet } from "../../lib/oCustom";

const ChatScreen = ({
  myWalletAddress, correspondentWalletAddress, messages, navigation, backRoute, addressWif
}) => {
  const dispatch = useDispatch();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [text, setText] = useState("");

  const onRemoveCorespondent = address => dispatch(removeCorrespondent({ address }));
  const onRemoveMessage = data => dispatch(removeMessage(data));
  const onClearChatHistory = address => dispatch(clearChatHistory({ address }));

  const onSend = (messages = []) => {
    if (messages) {
      const { address, pubKey } = _.get(
        navigation,
        'state.params.correspondent',
      );
      dispatch(addMessageStart({
        address,
        pubKey,
        type: 'text',
        message: messages[0].text,
      }));
    }
  };

  const onLoadEarlier = () => {
    // TODO: make pagination from reducer
  };

  const copyText = (text) => {
    Clipboard.setString(text);
    dispatch(setToastMessage({
      message: 'Copied to clipboard',
      duration: 1000
    }))
  };

  const renderTextMessage = (style, text) => (
    <Text
      style={style}
      onLongPress={() => copyText(text)}
    >
      {text}
    </Text>
  );

  const renderTouchableMessage = (style, parsedText, pressAction) => (
    <TouchableOpacity
      onPress={pressAction}
      onLongPress={() => copyText(parsedText)}
    >
      <Text style={style}>{parsedText}</Text>
    </TouchableOpacity>
  );

  const renderText = ({ currentMessage }) => {
    const { text, user } = currentMessage;
    const { parsedText, type, params } = parseTextMessage(text);
    let style = styles.textMessage;
    let pressAction = () => {};

    if (type) {
      style = { ...style, ...styles.actionMessage };
    }

    if (user._id === 1) {
      style = { ...style, ...styles.textMessageSent };
    }

    switch (type) {
      case 'TEXTCOINT':
      case 'DATA':
      case 'PAYMENT':
      case 'VOTE':
      case 'PROFILE':
      case 'PROFILE_REQUEST':
      case 'PROSAIC_CONTRACT': {
        pressAction = () => copyText(params.originText);
        break;
      }
      case "COMMAND": {
        if (user._id === 1) {
          pressAction = () => copyText(params.originText);
        } else {
          pressAction = () => onSend([{ text: parsedText }]);
        }
        break;
      }
      case "SUGGEST_COMMAND": {
        if (user._id === 1) {
          pressAction = () => copyText(params.originText);
        } else {
          pressAction = () => setText(parsedText);
        }
        break;
      }
      case 'SIGN_MESSAGE_REQUEST': {
        if (user._id !== 1) {
          pressAction = () => {
            Alert.alert('Do you want to sign this message?', '', [
              { text: 'No', style: 'cancel' },
              {
                text: 'Yes',
                onPress: () => {
                  const { privateKey } = fromWif(addressWif, testnet);
                  const signedMessage = signMessage(
                    params.messageToSign,
                    {
                      testnet,
                      privateKey
                    }
                  );
                  const message = Buffer.from(JSON.stringify(signedMessage)).toString('base64');
                  onSend([{ text: `[Signed message](signed-message:${message})` }]);
                },
              },
            ]);
          };
        }
        break;
      }
      case 'REQUEST_PAYMENT': {
        if (user._id !== 1) {
          const {amount, address} = params;
          const paymentAmount = +amount.split("=")[1];
          pressAction = () => navigation.navigate('MakePayment', {walletAddress: address, amount: paymentAmount});
        }
        break;
      }
      case "WALLET_ADDRESS": {
        if (user._id !== 1) {
          const {address} = params;
          pressAction = () => navigation.navigate('MakePayment', {walletAddress: address});
        }
        break;
      }
    }

    switch (type) {
      case null: return renderTextMessage(style, parsedText);
      case 'WALLET_ADDRESS': {
        if (user._id === 1) {
          return renderTextMessage(style, parsedText);
        } else {
          return renderTouchableMessage(style, parsedText, pressAction);
        }
      }
      case 'URL': {
        return (
          <TouchableOpacity
            onPress={() => Linking.openURL(parsedText)}
            onLongPress={() => copyText(parsedText)}
          >
            <Text style={user._id === 1
              ? { ...style, ...styles.url }
              : { ...style, ...styles.url, ...styles.blueUrl }}
            >
              {parsedText}
            </Text>
          </TouchableOpacity>
        );
      }
      case "COMMAND":
      case "SUGGEST_COMMAND": {
        if (user._id !== 1) {
          return (
            <TouchableOpacity
              onPress={pressAction}
              onLongPress={() => copyText(params.originText)}
            >
              <Text style={{ ...style, ...styles.command }}>
                {parsedText}
              </Text>
              {type === "SUGGEST_COMMAND" && (
                <View style={styles.dotLineContainer}>
                  <View style={styles.dotLine} />
                </View>
              )}
            </TouchableOpacity>
          )
        } else {
          return renderTouchableMessage(style, parsedText, pressAction);
        }
      }
      default: {
        return renderTouchableMessage(style, parsedText, pressAction)
      }
    }
  };

  const chatLoading = () => (
    <View style={styles.chatLoader}>
      <Text>Loading...</Text>
    </View>
  );

  const correspondent = useMemo(
    () => _.get(navigation, 'state.params.correspondent'),
    [navigation]
  );

  return (
    <SafeAreaView
      style={styles.container}
      forceInset={{ top: 'always', bottom: 'always' }}
    >
      <Header
        hasBackButton
        hasBorder
        backRoute={backRoute}
        size='compact'
        titlePosition='left'
        title={correspondent.name}
        navigation={navigation}
        right={
          <ActionsBar
            navigation={navigation}
            myWalletAddress={myWalletAddress}
            clearChatHistory={onClearChatHistory}
            removeCorrespondent={onRemoveCorespondent}
            onSend={onSend}
            correspondentWalletAddress={correspondentWalletAddress}
            correspondentAddress={correspondent.address}
          />
        }
      />
      <GiftedChat
        text={text}
        onInputTextChanged={setText}
        scrollToBottom
        bottomOffset={0}
        style={styles.chatArea}
        renderAvatar={null}
        renderMessageText={renderText}
        renderLoading={chatLoading}
        showUserAvatar={false}
        messages={messages}
        onSend={onSend}
        onLoadEarlier={onLoadEarlier}
        user={{ _id: 1 }}
      />
    </SafeAreaView>
  );
};

const mapStateToProps = (state, props) =>
  createStructuredSelector({
    myWalletAddress: selectWalletAddress(),
    correspondentWalletAddress: selectCorrespondentWalletAddress(
      props.navigation.state.params.correspondent.address,
    ),
    messages: selectCorrespondentMessages({
      address: props.navigation.state.params.correspondent.address,
    }),
    addressWif: selectAddressWif()
  });

export default connect(mapStateToProps, null)(ChatScreen);
