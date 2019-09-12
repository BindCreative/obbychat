import React from 'react';
import PropTypes from 'prop-types';
import { Container, View, Text } from 'native-base';
import { colors } from './../../constants';
import styles from './styles';
import Header from './../Header';
import ActionsBar from './ActionsBar';


class WalletScreen extends React.Component {
  static navigationOptions = {
    title: 'Wallet',
    header: props => <Header {...props} right={<ActionsBar />} />,
  };

  render() {
    return (
      <Container style={styles.content}>
      </Container>
    );
  }
}

export default WalletScreen;