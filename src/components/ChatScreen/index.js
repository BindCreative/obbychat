import React from 'react';
import { Keyboard, TouchableOpacity } from 'react-native';
import { Container, View, Text } from 'native-base';
import { GiftedChat } from 'react-native-gifted-chat';
import ActionSheet from 'react-native-actionsheet';
import UserAvatar from 'react-native-user-avatar';
import makeBlockie from 'ethereum-blockies-base64';
import ArrowLeftIcon from './../../assets/images/icon-arrow-left.svg';
import MoreIcon from './../../assets/images/icon-more.svg';
import ReceiveIcon from './../../assets/images/icon-receive.svg';
import SendIcon from './../../assets/images/icon-send.svg';
import styles from './styles';
import { colors } from './../../constants/';


class ChatListScreen extends React.Component {
  static state = {
    keyboardVisible: false,
    messages: [],
  }

  constructor(props) {
    super(props);
    this.ActionSheet = {};
    this.showMoreActions = this.showMoreActions.bind(this);
    this.onSend = this.onSend.bind(this);
  }

  componentWillMount() {
    // Handle keyboard in state
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => this.setState({ keyboardVisible: true }));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => this.setState({ keyboardVisible: false }));
    // Load latest messages
    this.setState({
      messages: [
        {
          _id: 1,
          text: 'Hello developer',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
          },
        },
      ],
    })
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }))
  }

  showMoreActions() {
    this.ActionSheet.show();
  }

  render() {
    const contact = this.props.navigation.state.params.contact;

    return (
      <Container>
        <ActionSheet
          tintColor={colors.black}
          ref={o => this.ActionSheet = o}
          options={[
            'Insert my address',
            //'Insert private profile',
            //'Sign a message',
            //'Offer a smart contract',
            'Cancel'
          ]}
          cancelButtonIndex={1}
          destructiveButtonIndex={1}
          onPress={(index) => { alert('TODO') }}
        />
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => this.props.navigation.pop()}
            >
              <ArrowLeftIcon color='#000000' height={24} width={24} />
            </TouchableOpacity>
            {this.state.keyboardVisible && <Text style={styles.headerTitleSmall}>{contact.nickname}</Text>}
          </View>
          {!this.state.keyboardVisible &&
            <View style={styles.headerCenter}>
              <UserAvatar size={60} name={contact.nickname} src={makeBlockie(contact.walletAddress)} />
              <Text style={styles.headerTitle}>{contact.nickname}</Text>
            </View>
          }
          <View style={styles.headerRight}>
            {this.state.keyboardVisible &&
              <React.Fragment>
                <View>
                  <TouchableOpacity style={styles.iconButtonSmall} onPress={() =>  this.props.navigation.navigate('RequestPayment', { recipientWallet: contact.walletAddress })}>
                    <ReceiveIcon style={styles.icon} width={14} height={14} />
                  </TouchableOpacity>
                </View>
                <View>
                  <TouchableOpacity style={styles.iconButtonSmall} onPress={() =>  this.props.navigation.navigate('MakePayment', { recipientWallet: contact.walletAddress })}>
                    <SendIcon style={styles.icon} width={14} height={14} />
                  </TouchableOpacity>
                </View>
                <View>
                  <TouchableOpacity style={styles.iconButtonSmallTransparent} onPress={this.showMoreActions}>
                    <MoreIcon style={styles.icon} width={14} height={14} />
                  </TouchableOpacity>
                </View>
              </React.Fragment>
            }
          </View>
          {!this.state.keyboardVisible &&
            <View style={styles.headerActionsBar}>
              <View>
                <TouchableOpacity style={styles.iconButton} onPress={() =>  this.props.navigation.navigate('RequestPayment', { recipientWallet: contact.walletAddress })}>
                  <ReceiveIcon style={styles.icon} width={20} height={20} />
                </TouchableOpacity>
                <Text style={styles.iconBottomText}>Request</Text>
              </View>
              <View>
                <TouchableOpacity style={styles.iconButton} onPress={() =>  this.props.navigation.navigate('MakePayment', { recipientWallet: contact.walletAddress })}>
                  <SendIcon style={styles.icon} width={20} height={20} />
                </TouchableOpacity>
                <Text style={styles.iconBottomText}>Send</Text>
              </View>
              <View>
                <TouchableOpacity style={styles.iconButtonTransparent} onPress={this.showMoreActions}>
                  <MoreIcon style={styles.icon} width={20} height={20} />
                </TouchableOpacity>
                <Text style={styles.iconBottomText}>More</Text>
              </View>
            </View>
          }
        </View>
        <GiftedChat
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{
            id: 1,
          }}
        />
      </Container>
    );
  }
}

export default ChatListScreen;