import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import UserAvatar from 'react-native-user-avatar';
import {
  Container,
  Text,
  List,
  ListItem,
  Left,
  Right,
  Body,
} from 'native-base';
import { colors } from './../../constants';
import styles from './styles';
import ActionsBar from './ActionsBar';


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
  static navigationOptions = {
    title: 'Chat',
    headerStyle: styles.header,
    headerTintColor: colors.black,
    headerTitleStyle: styles.headerTitle,
    headerRight: <ActionsBar />,
  };

  render() {
    return (
      <ScrollView>
        <Container style={styles.content}>
          <List style={styles.list}>
            {contacts.map((contact, i) => (
              <ListItem avatar style={styles.list} key={i} onPress={() => this.props.navigation.navigate('ContactChat', { name: contact.nickname })}>
                <Left style={styles.listItemAvatar}>
                  <UserAvatar size={42} name={contact.nickname} src={contact.avatarThumb} />
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