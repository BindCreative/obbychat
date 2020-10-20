import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import PropTypes from 'prop-types';
import { View, Text, InteractionManager, Alert, Image } from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import { Content, List, ListItem, Left, Right, Icon } from 'native-base';
import ContentLoader, { Circle } from 'react-content-loader/native';
import makeBlockie from 'ethereum-blockies-base64';

import ArrowLeftIcon from '../../assets/images/icon-arrow-left.svg';

import { selectWalletAddress } from './../../selectors/wallet';
import styles from './styles';

class SettingsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initialized: false
    }
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.setState({ initialized: true });
    });
  }

  render() {
    const { navigation, walletAddress } = this.props;

    const { src } = this.state;

    return (
      <SafeAreaView
        style={styles.content}
        forceInset={{ top: 'always', bottom: 'always' }}
      >
        <View style={styles.headerNormal}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
        {this.state.initialized && (
          <Fragment>
            <View style={styles.userInfo}>
              {!!walletAddress && (
                <Image
                  style={styles.userAvatar}
                  source={{ uri: makeBlockie(walletAddress) }}
                />
              )}
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
                    <ArrowLeftIcon height={18} width={18} style={styles.listArrowIcon} />
                  </Right>
                </ListItem>
              </List>
            </Content>
          </Fragment>
        )}
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
