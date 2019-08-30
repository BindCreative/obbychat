import React from 'react';
import PropTypes from 'prop-types';
import { Container, View, Text, Button, Icon } from 'native-base';
import { colors } from './../../constants';
import styles from './styles';
import ActionsBar from './ActionsBar';


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
      <Container style={styles.content}>

      </Container>
    );
  }
}

export default ChatListScreen;