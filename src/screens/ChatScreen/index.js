import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { TouchableOpacity, Text, Clipboard, Alert } from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import { GiftedChat } from 'react-native-gifted-chat';

import _ from 'lodash';

import styles from './styles';
import { signMessage } from '../../lib/oCustom';
import { parseTextMessage } from '../../lib/messaging';
import { addMessageStart, removeMessage } from '../../actions/messages';
import { clearChatHistory } from '../../actions/correspondents';
import { selectCorrespondentMessages } from '../../selectors/messages';
import { selectWalletAddress } from '../../selectors/wallet';
import { selectCorrespondentWalletAddress } from '../../selectors/messages';
import ActionsBar from './ActionsBar';
import Header from '../../components/Header';

class ChatScreen extends React.Component {
  constructor(props) {
    super(props);
    this.onSend = this.onSend.bind(this);
    this.renderText = this.renderText.bind(this);
    this.onLoadEarlier = this.onLoadEarlier.bind(this);
    this.renderChat = this.renderChat.bind(this);
    this.state = {
      keyboardVisible: false,
    };
  }

  onSend(messages = []) {
    if (messages) {
      const { address, pubKey } = _.get(
        this.props.navigation,
        'state.params.correspondent',
      );
      this.props.addMessageStart({
        address,
        pubKey,
        type: 'text',
        message: messages[0].text,
      });
    }
  }

  onLoadEarlier() {
    // TODO: make pagination from reducer
  }

  renderText(props) {
    const { text, user } = props.currentMessage;
    const { parsedText, type, params } = parseTextMessage(text);
    let style = { ...styles.textMessage };
    let pressAction = () => {};

    if (type) {
      style = { ...style, ...styles.actionMessage };
    }

    if (user._id === 1) {
      style = { ...style, ...styles.textMessageSent };
    } else {
      if (type === 'SIGN_MESSAGE_REQUEST') {
        pressAction = () => {
          Alert.alert('Do you want to sign this message?', '', [
            { text: 'No', style: 'cancel' },
            {
              text: 'Yes',
              onPress: () => {
                const signedMessage = signMessage(
                  params.messageToSign,
                  this.props.myWalletAddress,
                );
                this.onSend([{ text: signedMessage }]);
              },
            },
          ]);
        };
      }
    }

    if (type) {
      return (
        <TouchableOpacity
          onPress={pressAction}
          onLongPress={() => {
            Clipboard.setString(parsedText);
          }}
        >
          <Text style={style}>{parsedText}</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <Text
          style={style}
          onLongPress={() => {
            Clipboard.setString(parsedText);
          }}
        >
          {parsedText}
        </Text>
      );
    }
  }

  renderChat() {
    const { messages } = this.props;
    return (
      <GiftedChat
        scrollToBottom
        bottomOffset={0}
        style={styles.chatArea}
        renderAvatar={null}
        renderMessageText={this.renderText}
        showUserAvatar={false}
        messages={messages}
        onSend={messagesArr => this.onSend(messagesArr)}
        onLoadEarlier={this.onLoadEarlier}
        user={{
          _id: 1,
        }}
      />
    );
  }

  render() {
    const { navigation } = this.props;
    const correspondent = _.get(
      this.props.navigation,
      'state.params.correspondent',
    );

    return (
      <SafeAreaView
        style={styles.container}
        forceInset={{ top: 'always', bottom: 'always' }}
      >
        <Header
          hasBackButton
          hasBorder
          size='compact'
          titlePosition='left'
          title={correspondent.name}
          right={
            <ActionsBar
              {...this.props}
              onSend={this.onSend}
              correspondentWalletAddress={correspondent.address}
            />
          }
          navigation={navigation}
        />
        {this.renderChat()}
      </SafeAreaView>
    );
  }
}

const mapStateToProps = (state, props) =>
  createStructuredSelector({
    myWalletAddress: selectWalletAddress(),
    correspondentWalletAddress: selectCorrespondentWalletAddress(
      props.navigation.state.params.correspondent.address,
    ),
    messages: selectCorrespondentMessages({
      address: props.navigation.state.params.correspondent.address,
    }),
  });

const mapDispatchToProps = dispatch => ({
  addMessageStart: payload => dispatch(addMessageStart(payload)),
  removeMessage: payload => dispatch(removeMessage(payload)),
  clearChatHistory: address => dispatch(clearChatHistory({ address })),
});

ChatScreen = connect(mapStateToProps, mapDispatchToProps)(ChatScreen);
export default ChatScreen;
