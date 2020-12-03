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

const messageTypes = [
  "WALLET_ADDRESS",
  "REQUEST_PAYMENT",
  "SIGN_MESSAGE_REQUEST",
  "SIGNED_MESSAGE",
  "URL",
  "COMMAND",
  "SUGGEST_COMMAND"
];

const ChatScreen = ({
  myWalletAddress, correspondentWalletAddress, messages, navigation, backRoute, addressWif
}) => {
  const dispatch = useDispatch();
  const [text, setText] = useState("");

  const onRemoveCorespondent = address => dispatch(removeCorrespondent({ address }));
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

  const renderText = ({ currentMessage }) => {
    const { text, user } = currentMessage;
    const { originalText, parsedText, actions } = parseTextMessage(text);
    let style = styles.text;

    if (user._id === 1) {
      style = { ...style, ...styles.textMessageSent };
    }

    const replaceText = ({ type, ...data }) => {
      const replacedStyle = { ...style, ...styles.actionMessage, ...styles.command };
      switch (type) {
        case "TEXTCOIN":
        case "DATA":
        case "PAYMENT":
        case "VOTE":
        case "PROFILE":
        case "PROFILE_REQUEST":
        case "PROSAIC_CONTRACT": {
          const { text } = data;
          return (
            <Text style={style}>{text}</Text>
          )
        }
        case "WALLET_ADDRESS": {
          const { address, pre, post } = data;
          return user._id !== 1
            ? (
              <TouchableOpacity onPress={() => navigation.navigate('MakePayment', { walletAddress: data.address })}>
                <Text style={replacedStyle}>{address}</Text>
              </TouchableOpacity>
            )
            : <Text style={style}>{address}</Text>
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
            : <Text style={style}>{`Payment request: ${amount}\n${address}`}</Text>
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
            : <Text style={style}>{`Request to sign message: \"${messageToSign}\"`}</Text>
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
            : <Text style={style}>{description}</Text>
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
            : <Text style={style}>{description}</Text>
        }
      }
    };

    if (!Object.keys(actions).length) {
      return (
        <Text style={{ ...styles.message, ...style }}>
          {originalText}
        </Text>
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
        <Text style={styles.message}>
          {splittedText.map((text) => {
            if (typeof text === 'string') {
              return text ? <Text style={style}>{text}</Text> : null
            } else {
              return text
            }
          })}
        </Text>
      )
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
