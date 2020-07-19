import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import PropTypes from 'prop-types';
import { View, Text } from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import { Content, List, ListItem, Left, Right, Icon } from 'native-base';
import UserAvatar from 'react-native-user-avatar';
import ContentLoader, { Circle } from 'react-content-loader/native';
import makeBlockie from 'ethereum-blockies-base64';

import Header from '../../components/Header';
import { selectWalletAddress } from './../../selectors/wallet';
import styles from './styles';



class SettingsScreen extends React.Component {
  render() {
    const { navigation, walletAddress } = this.props;

    return (
      <SafeAreaView
        style={styles.content}
        forceInset={{ top: 'always', bottom: 'always' }}
      >
        <Header title='Settings' {...this.props} />
        <View style={styles.userInfo}>
          {!!walletAddress &&
          <UserAvatar
            size={64}
            name={walletAddress}
            src={makeBlockie(walletAddress)}
          />
          }
          {!walletAddress &&
            <ContentLoader>
              <Circle cx='32' cy='32' r='32' />
            </ContentLoader>
          }
        </View>
        <Content>
          <List style={styles.list}>
            <ListItem itemHeader style={styles.listItemHeader}>
              <Text style={styles.listItemHeaderText}>Security</Text>
            </ListItem>
            <ListItem
              onPress={() => navigation.navigate('SeedWords')}
              style={styles.listItem}
            >
              <Left>
                <Text style={styles.listItemText}>Recovery words</Text>
              </Left>
              <Right>
                <Icon name='arrow-forward' style={styles.listArrowIcon} />
              </Right>
            </ListItem>
          </List>
        </Content>
      </SafeAreaView>
    );
  }
}

SettingsScreen.propTypes = {
  walletAddress: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  walletAddress: selectWalletAddress(),
});

SettingsScreen = connect(mapStateToProps)(SettingsScreen);
export default SettingsScreen;
