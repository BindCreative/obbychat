import React from 'react';
import PropTypes from 'prop-types';
import { Container } from 'native-base';
import { colors } from '../../constants';
import styles from './styles';


class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: 'Settings',
    headerStyle: styles.header,
    headerTintColor: colors.black,
    headerTitleStyle: styles.headerTitle,
  };

  render() {
    return (
      <Container style={styles.content}>
      </Container>
    );
  }
}

export default SettingsScreen;