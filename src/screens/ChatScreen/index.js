import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { TouchableOpacity, Text, Clipboard } from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import { GiftedChat } from 'react-native-gifted-chat';

import _ from 'lodash';

import styles from './styles';
import { addMessageStart, removeMessage } from '../../actions/messages';
import { selectCorrespondentMessages } from '../../selectors/messages';
import { selectWalletAddress } from '../../selectors/wallet';
import { parseTextMessage } from '../../lib/messaging';
import ActionsBar from './ActionsBar';
import Header from '../../components/Header';

class ChatScreen extends React.Component {
  constructor(props) {
    super(props);
    this.onSend = this.onSend.bind(this);
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
    const { parsedText } = parseTextMessage(text);
    let style = { ...styles.textMessage };

    if (user._id === 1) {
      style = { ...style, ...styles.textMessageSent };
    }

    return (
      <TouchableOpacity
        onLongPress={() => {
          Clipboard.setString(parsedText);
        }}
      >
        <Text style={style}>{parsedText}</Text>
      </TouchableOpacity>
    );
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
    const { name } = _.get(this.props.navigation, 'state.params.correspondent');

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
          title={name}
          right={
            <ActionsBar
              {...this.props}
              onRequestPayment={this.onSend}
              onSendPayment={() => alert('TODO')}
              onSend={this.onSend}
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
    messages: selectCorrespondentMessages({
      address: props.navigation.state.params.correspondent.address,
    }),
  });

const mapDispatchToProps = dispatch => ({
  addMessageStart: payload => dispatch(addMessageStart(payload)),
  removeMessage: payload => dispatch(removeMessage(payload)),
});

ChatScreen = connect(mapStateToProps, mapDispatchToProps)(ChatScreen);
export default ChatScreen;
