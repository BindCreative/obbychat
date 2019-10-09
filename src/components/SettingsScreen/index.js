import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import PropTypes from 'prop-types';
import { Container, View, Content, List, ListItem, Text, Left, Body, Right, Icon } from 'native-base';
import UserAvatar from 'react-native-user-avatar';
import makeBlockie from 'ethereum-blockies-base64';
import Header from './../Header';
import { selectInitialAddress } from './../../selectors/wallet';
import styles from './styles';


class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: 'Settings',
    header: props => <Header {...props} />,
  };

  render() {
    const {
      navigation,
      initialWalletAddress
    } = this.props;
    
    return (
      <Container style={styles.content}>
        <View style={styles.userInfo}>
          <UserAvatar size={64} name={initialWalletAddress} src={makeBlockie(initialWalletAddress)} />
        </View>
        <Content>
          <List style={styles.list}>
            <ListItem itemHeader style={styles.listItemHeader}>
              <Text style={styles.listItemHeaderText}>Security</Text>
            </ListItem>
            <ListItem onPress={() => navigation.navigate('SeedWords')} style={styles.listItem}>
              <Left>
                <Text style={styles.listItemText}>Recovery words</Text>
              </Left>
              <Right><Icon name='arrow-forward' style={styles.listArrowIcon} /></Right>
            </ListItem>
          </List>
        </Content>
      </Container>
    );
  }
}

SettingsScreen.propTypes = {
  initialWalletAddress: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  initialWalletAddress: selectInitialAddress(),
});

SettingsScreen = connect(mapStateToProps)(SettingsScreen);
export default SettingsScreen;