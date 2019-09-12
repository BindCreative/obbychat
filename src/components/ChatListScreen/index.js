import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import UserAvatar from 'react-native-user-avatar';
import makeBlockie from 'ethereum-blockies-base64';
import {
  Container,
  Text,
  List,
  ListItem,
  Left,
  Right,
  Body,
  View,
} from 'native-base';
import { colors } from './../../constants';
import styles from './styles';
import ActionsBar from './ActionsBar';
import Header from './../Header';


const contacts = [
  {
    id: 1,
    nickname: 'Tarmo',
    walletAddress: '1aTest',
  },
  {
    id: 2,
    nickname: 'Alvar',
    walletAddress: '3bTest',
  },
  {
    id: 3,
    nickname: 'Amid',
    walletAddress: '6cTest',
  },
];


class ChatListScreen extends React.Component {
  static navigationOptions = {
    title: 'Chat',
    header: props => <Header {...props} right={<ActionsBar />} />,
  };

  render() {
    return (
      <ScrollView>
        <Container style={styles.content}>
          <List style={styles.list}>
            {contacts.map((contact, i) => (
              <ListItem avatar style={styles.listItem} key={i} onPress={() => this.props.navigation.push('ContactChat', { name: contact.nickname })}>
                <Left style={styles.listItemAvatar}>
                
                  <UserAvatar size={42} name={contact.nickname} src={makeBlockie(contact.walletAddress)} />
                </Left>
                <Body style={styles.listItemBody}>
                  <Text>{contact.nickname}</Text>
                  <Text note>Lorem ipsum...</Text>
                </Body>
                <Right style={styles.listItemBody}>
                  <Text note>Yesterday</Text>
                </Right>
              </ListItem>
            ))}
          </List>
        </Container>
      </ScrollView>
    );
  }
}

export default ChatListScreen;