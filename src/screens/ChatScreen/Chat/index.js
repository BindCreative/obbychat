import React, { useState, Fragment, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { TouchableOpacity, Text, Clipboard, Alert, View, Linking, TextInput, Platform, Keyboard, ScrollView } from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import { GiftedChat, InputToolbar, Composer } from 'react-native-gifted-chat';
import NetInfo from "@react-native-community/netinfo";

import styles from './styles';
import { signMessage, fromWif } from 'obyte/lib/utils';
import { parseTextMessage } from '../../../lib/messaging';
import { addMessageStart, removeMessage, openPaymentFromChat } from '../../../actions/messages';
import {
  clearChatHistory,
  removeCorrespondent,
} from '../../../actions/correspondents';
import { openPaymentLink } from "../../../actions/wallet";
import { selectCorrespondentMessages, selectCorrespondentWalletAddress } from "../../../selectors/main";
import { selectWalletAddress, selectAddressWif } from "../../../selectors/temporary";
import { testnet, parseQueryString } from "../../../lib/oCustom";

import WarningIcon from '../../../assets/images/warning.svg';
import {setToastMessage} from "../../../actions/app";

import CustomHeader from './CustomHeader';

const ChatScreen = ({
  myWalletAddress, correspondentWalletAddress, messages, navigation, backRoute, addressWif, correspondent
}) => {
  const dispatch = useDispatch();
  const [text, setText] = useState("");
  const [lines, setLines] = useState(1);
  const [composerHeight, setComposerHeight] = useState(0);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [inputWidth, setInputWidth] = useState(0);
  const [linesWidths, setLinesWidths] = useState([]);

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
      onSend([{ text: `[Data request](sign-message-request:${text.trim()})` }]);
    }
  };

  const insertAddress = (address) => {
    let separator = "";
    if (text) {
      separator = text[text.length - 1] === " " ? "\n" : " \n"
    }
    const newText = `${text}${separator}${address} `;
    setText(newText);
  };

  const handleShowKeyboard = () => setKeyboardOpen(true);

  const handleHideKeyboard = () => setKeyboardOpen(false);

  useEffect(
    () => {
      Keyboard.addListener('keyboardDidShow', handleShowKeyboard);
      Keyboard.addListener('keyboardDidHide', handleHideKeyboard);
      return () => {
        Keyboard.removeListener('keyboardDidShow', handleShowKeyboard);
        Keyboard.removeListener('keyboardDidHide', handleHideKeyboard);
      }
    },
    []
  );

  useEffect(
    () => {
      let newLines = linesWidths.length
        ? linesWidths.reduce((counter, width) => counter + (width ? Math.ceil(width / inputWidth) : 1), 0)
        : 1;
      setLines(newLines);
    },
    [linesWidths, inputWidth]
  );

  useEffect(
    () => {
      setComposerHeight((lines * 16) + 24);
    },
    [lines]
  );

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
            <Text
              onPress={() => dispatch(openPaymentFromChat(unitId))}
              style={replacedStyle}
            >
              {`Payment: ${amount} bytes`}
            </Text>
          )
        }
        case "WALLET_ADDRESS": {
          const { address } = data;
          return user._id !== 1
            ? (
              <Text
                style={replacedStyle}
                onPress={() => navigation.navigate('MakePayment', { walletAddress: data.address })}
              >
                {address}
              </Text>
            )
            : <Text style={replacedStyle}>{address}</Text>
        }
        case "REQUEST_PAYMENT": {
          const { walletAddress, query } = data;
          const { amount } = parseQueryString(query);
          return user._id !== 1
            ? (
              <Fragment>
                <Text style={style}>Payment request: </Text>
                <Text
                  style={replacedStyle}
                  onPress={() => dispatch(openPaymentLink({ walletAddress, query, correspondent }))}
                >
                  {`${amount}\n${walletAddress}`}
                </Text>
              </Fragment>
            )
            : (
              <Text>
                <Text style={style}>Payment request: </Text>
                <Text style={replacedStyle}>{`${amount}\n${walletAddress}`}</Text>
              </Text>
            )
        }
        case "SIGN_MESSAGE_REQUEST": {
          const { messageToSign } = data;
          return user._id !== 1
            ? (
              <Fragment>
                <Text style={style}>Request to sign message: </Text>
                <Text
                  style={replacedStyle}
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
                  {`\"${messageToSign}\"`}
                </Text>
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
            <Text
              style={{ ...replacedStyle, ...styles.url }}
              onPress={() => Linking.openURL(url)}
            >
              {url}
            </Text>
          )
        }
        case "COMMAND": {
          const { command, description } = data;
          return user._id !== 1
            ? (
              <Text
                style={replacedStyle}
                onPress={() => onSend([{ text: command }])}
              >
                {description}
              </Text>
            )
            : <Text style={replacedStyle}>{description}</Text>
        }
        case "SUGGEST_COMMAND": {
          const { command, description } = data;
          return user._id !== 1
            ? (
              <Text onPress={() => setText(command)}>
                <Text style={{ ...styles.command, ...styles.suggestCommand }}>{description}</Text>
                <View style={styles.dotLineContainer}>
                  <View style={styles.dotLine} />
                </View>
              </Text>
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

  const onLineLayout = (event, index) => {
    let newLinesWidths = [...linesWidths];
    if (newLinesWidths[index] === undefined) {
      newLinesWidths[index] = event.layout.width;
    } else {
      newLinesWidths = newLinesWidths.filter((width, widthIndex) => widthIndex < index);
      newLinesWidths[index] = event.layout.width;
    }
    setLinesWidths(newLinesWidths);
  };

  return (
    <SafeAreaView
      style={styles.container}
      forceInset={{ top: 'always', bottom: 'always' }}
    >
      <ScrollView horizontal style={styles.linesScrollView}>
        {text.split(/\r\n|\r|\n/).map((textLine, index) => (
          <Text
            key={textLine}
            onLayout={({ nativeEvent }) => onLineLayout(nativeEvent, index)}
            style={styles.lineText}
          >
            {textLine}
          </Text>
        ))}
      </ScrollView>
      <CustomHeader
        correspondent={correspondent}
        navigation={navigation}
        keyboardOpen={keyboardOpen}
        backRoute={backRoute}
        myWalletAddress={myWalletAddress}
        onClearChatHistory={onClearChatHistory}
        onRemoveCorespondent={onRemoveCorespondent}
        onSend={onSend}
        onRequestSignMessage={onRequestSignMessage}
        insertAddress={insertAddress}
        correspondentWalletAddress={correspondentWalletAddress}
      />
      <GiftedChat
        text={text}
        onInputTextChanged={setText}
        scrollToBottom
        bottomOffset={0}
        renderAvatar={null}
        renderMessageText={renderText}
        renderLoading={chatLoading}
        showUserAvatar={false}
        messages={messages}
        onSend={onSend}
        onLoadEarlier={onLoadEarlier}
        user={{ _id: 1 }}
        keyboardShouldPersistTaps="never"
        renderInputToolbar={(props) => (
          <InputToolbar
            {...props}
            composerHeight={Math.min(Platform.OS === 'ios' ? props.composerHeight : Math.max(composerHeight, props.composerHeight), props.maxComposerHeight)}
          />
        )}
        renderComposer={(props) => (
          <Composer
            {...props}
            onInputSizeChanged={(size) => {
              props.onInputSizeChanged(size);
              setInputWidth(size.width - 12);
            }}
          />
        )}
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
