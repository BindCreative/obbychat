import React, { useState, Fragment } from 'react';
import { connect, useDispatch } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { TouchableOpacity, Text, Clipboard, Alert, View, Linking } from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import { GiftedChat } from 'react-native-gifted-chat';
import NetInfo from "@react-native-community/netinfo";

import styles from './styles';
import { signMessage, fromWif } from 'obyte/lib/utils';
import { parseTextMessage } from '../../../lib/messaging';
import { addMessageStart, removeMessage, openPaymentFromChat } from '../../../actions/messages';
import {
  clearChatHistory,
  removeCorrespondent,
} from '../../../actions/correspondents';
import { selectCorrespondentMessages, selectCorrespondentWalletAddress } from "../../../selectors/main";
import { selectWalletAddress, selectAddressWif } from "../../../selectors/temporary";
import ActionsBar from './ActionsBar';
import Header from '../../../components/Header';
import { testnet } from "../../../lib/oCustom";

import WarningIcon from '../../../assets/images/warning.svg';

const ChatScreen = ({
  myWalletAddress, correspondentWalletAddress, messages, navigation, backRoute, addressWif, correspondent
}) => {
  const dispatch = useDispatch();
  const [text, setText] = useState("");

  const onRemoveCorespondent = address => dispatch(removeCorrespondent({ address }));
  const onClearChatHistory = address => dispatch(clearChatHistory({ address }));

  const onSend = (messages = []) => {
    if (messages) {
      const { address, pubKey } = correspondent;
      NetInfo.fetch().then(state => {
        const { isConnected } = state;
        dispatch(addMessageStart({
          address,
          pubKey,
          type: 'text',
          message: messages[0].text,
          isConnected
        }));
      });
      setText("");
    }
  };

  const onRequestSignMessage = () => {
    if (!text) {
      Alert.alert('', 'Text field is empty');
    } else {
      onSend([{ text: `[Data request](sign-message-request:${text})` }]);
    }
  };

  const insertAddress = (address) => {
    let separator = "";
    if (text) {
      separator = text[text.length - 1] === " " ? "\n" : " \n"
    }
    setText(`${text}${separator}${address} `);
  };

  const onLoadEarlier = () => {
    // TODO: make pagination from reducer
  };

  const renderText = ({ currentMessage }) => {
    const { text, user, sendingError, hash } = currentMessage;
    const { originalText, parsedText, actions } = parseTextMessage(text);
    let style = styles.text;

    if (user._id === 1) {
      style = { ...style, ...styles.textMessageSent };
    }

    const resendMessage = () => {
      const { address } = correspondent;
      dispatch(removeMessage({ messageHash: hash, address }));
      onSend([{ text }]);
    };

    const sendingErrorText = () => (
      <TouchableOpacity onPress={resendMessage}>
        <View style={styles.errorMessageContainer}>
          <WarningIcon style={styles.errorImage} width={18} height={18} />
          <Text style={styles.errorMessage}>Couldn't send. Tap to try again</Text>
        </View>
      </TouchableOpacity>
    );

    const replaceText = ({ type, ...data }) => {
      let replacedStyle = { ...style, ...styles.actionMessage, ...styles.command };
      if (user._id === 1) {
        replacedStyle = { ...replacedStyle, ...styles.outComingCommand }
      }
      switch (type) {
        case "TEXTCOIN":
        case "DATA":
        case "VOTE":
        case "PROFILE":
        case "PROFILE_REQUEST":
        case "PROSAIC_CONTRACT":
        case "PAIRING_CHAT": {
          const { text } = data;
          return (
            <Text style={style}>{text}</Text>
          )
        }
        case "PAYMENT": {
          const { unitId, amount } = data;
          return (
            <TouchableOpacity onPress={() => dispatch(openPaymentFromChat(unitId))}>
              <Text style={replacedStyle}>{`Payment: ${amount} bytes`}</Text>
            </TouchableOpacity>
          )
        }
        case "WALLET_ADDRESS": {
          const { address } = data;
          return user._id !== 1
            ? (
              <TouchableOpacity onPress={() => navigation.navigate('MakePayment', { walletAddress: data.address })}>
                <Text style={replacedStyle}>{address}</Text>
              </TouchableOpacity>
            )
            : <Text style={replacedStyle}>{address}</Text>
        }
        case "REQUEST_PAYMENT": {
          const { amount, address } = data;
          return user._id !== 1
            ? (
              <Fragment>
                <Text style={style}>Payment request: </Text>
                <TouchableOpacity onPress={() => navigation.navigate('MakePayment', { walletAddress: address, amount: +amount.split("=")[1] })}>
                  <Text style={replacedStyle}>{`${amount}\n${address}`}</Text>
                </TouchableOpacity>
              </Fragment>
            )
            : (
              <Text>
                <Text style={style}>Payment request: </Text>
                <Text style={replacedStyle}>{`${amount}\n${address}`}</Text>
              </Text>
            )
        }
        case "SIGN_MESSAGE_REQUEST": {
          const { messageToSign } = data;
          return user._id !== 1
            ? (
              <Fragment>
                <Text style={style}>Request to sign message: </Text>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert('Do you want to sign this message?', '', [
                      { text: 'No', style: 'cancel' },
                      {
                        text: 'Yes',
                        onPress: () => {
                          const { privateKey } = fromWif(addressWif, testnet);
                          const signedMessage = signMessage(data.messageToSign, { testnet, privateKey });
                          const message = Buffer.from(JSON.stringify(signedMessage)).toString('base64');
                          onSend([{ text: `[Signed message](signed-message:${message})` }]);
                        },
                      },
                    ]);
                  }}
                >
                  <Text style={replacedStyle}>{`\"${messageToSign}\"`}</Text>
                </TouchableOpacity>
              </Fragment>
            )
            : (
              <Text>
                <Text style={style}>Request to sign message: </Text>
                <Text style={replacedStyle}>{`\"${messageToSign}\"`}</Text>
              </Text>
            )
        }
        case "SIGNED_MESSAGE": {
          return <Text style={{ ...style, ...styles.actionMessage }}>{`Signed message: ${data.text}`}</Text>
        }
        case "URL": {
          const { url } = data;
          return (
            <TouchableOpacity onPress={() => Linking.openURL(url)}>
              <Text style={{ ...replacedStyle, ...styles.url }}>{url}</Text>
            </TouchableOpacity>
          )
        }
        case "COMMAND": {
          const { command, description } = data;
          return user._id !== 1
            ? (
              <TouchableOpacity onPress={() => onSend([{ text: command }])}>
                <Text style={replacedStyle}>{description}</Text>
              </TouchableOpacity>
            )
            : <Text style={replacedStyle}>{description}</Text>
        }
        case "SUGGEST_COMMAND": {
          const { command, description } = data;
          return user._id !== 1
            ? (
              <TouchableOpacity onPress={() => setText(command)}>
                <Text style={{ ...styles.command, ...styles.suggestCommand }}>{description}</Text>
                <View style={styles.dotLineContainer}>
                  <View style={styles.dotLine} />
                </View>
              </TouchableOpacity>
            )
            : (
              <View>
                <Text style={{ ...styles.command, ...styles.suggestCommand, ...styles.outComingCommand }}>{description}</Text>
                <View style={styles.dotLineContainer}>
                  <View style={{ ...styles.dotLine, ...styles.outComingDotLine }} />
                </View>
              </View>
            )
        }
      }
    };

    if (!Object.keys(actions).length) {
      return (
        <Fragment>
          <Text style={{ ...styles.message, ...style }}>
            {originalText}
          </Text>
          {sendingError && sendingErrorText()}
        </Fragment>
      )
    } else {
      const separators = Object.keys(actions).map(separator => `\\{${separator.slice(1, separator.length - 1)}\\}`);
      const separateRegExp = new RegExp(`(${separators.join('|')})`, "g");
      const splittedText = parsedText.split(separateRegExp);

      Object.keys(actions).map((key) => {
        const actionIndex = splittedText.indexOf(key);
        splittedText[actionIndex] = replaceText(actions[key]);
      });

      return (
        <Fragment>
          <Text style={styles.message}>
            {splittedText.map((text) => {
              if (typeof text === 'string') {
                return text ? <Text style={style}>{text}</Text> : null
              } else {
                return text
              }
            })}
          </Text>
          {sendingError && sendingErrorText()}
        </Fragment>
      )
    }
  };

  const chatLoading = () => (
    <View style={styles.chatLoader}>
      <Text>Loading...</Text>
    </View>
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
            onRequestSignMessage={onRequestSignMessage}
            insertAddress={insertAddress}
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
      props.correspondent.address,
    ),
    messages: selectCorrespondentMessages({
      address: props.correspondent.address,
    }),
    addressWif: selectAddressWif()
  });

export default connect(mapStateToProps, null)(ChatScreen);
