import React from 'react';
import PropTypes from 'prop-types';
import { Container, View, Text } from 'native-base';
import { colors } from './../../constants';
import styles from './styles';
import ActionsBar from './ActionsBar';


class WalletScreen extends React.Component {
  static navigationOptions = {
    title: 'Wallet',
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

export default WalletScreen;