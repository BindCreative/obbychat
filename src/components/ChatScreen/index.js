import React from 'react';
import UserAvatar from 'react-native-user-avatar';
import { Container } from 'native-base';
import { GiftedChat } from 'react-native-gifted-chat';
import { colors } from './../../constants';
import styles from './styles';


const contacts = [
  {
    id: 1,
    nickname: 'Tarmo',
    avatarThumb: null,
  },
  {
    id: 2,
    nickname: 'Alvar',
    avatarThumb: null,
  },
  {
    id: 3,
    nickname: 'Amid',
    avatarThumb: null,
  },
];


class ChatListScreen extends React.Component {
  static state = {
    messages: [],
  }

  componentWillMount() {
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

  render() {
    return (
      <Container>
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