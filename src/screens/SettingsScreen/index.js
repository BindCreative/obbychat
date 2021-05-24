import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import PropTypes from 'prop-types';
import { View, Text, InteractionManager, Alert, Image, ScrollView } from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import { List } from 'react-native-paper';
import ContentLoader, { Circle } from 'react-content-loader/native';
import makeBlockie from 'ethereum-blockies-base64';

import ArrowLeftIcon from '../../assets/images/icon-arrow-left.svg';

import { selectWalletAddress } from "../../selectors/temporary";
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
            <View>
              <ScrollView>
                <List.Item
                  title="Security"
                  titleStyle={styles.listItemHeaderText}
                />
                <List.Item
                  title="Recovery words"
                  titleStyle={styles.listItemText}
                  right={() => <ArrowLeftIcon height={18} width={18} style={styles.listArrowIcon} />}
                  onPress={() => navigation.navigate('SeedWords')}
                />
              </ScrollView>
            </View>
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
