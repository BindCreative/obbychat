import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { View, TextInput, FlatList, InteractionManager, Image, Linking, Text } from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import { Divider } from 'react-native-paper';
import Dialog from 'react-native-dialog';

import common from '../../constants/common';

import { setCorrespondentName, acceptInvitation } from '../../actions/correspondents';
import { selectCorrespondents, selectUnpairedBots } from '../../selectors/messages';
import styles from './styles';
import ActionsBar from './ActionsBar';
import Header from '../../components/Header';
import CorrespondentItem from './CorrespondentItem';
import BotItem from './BotItem';

const listSeparator = {
  type: 'separator'
};

class ChatListScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      changeNameDialog: {
        visible: false,
        correspondent: {},
      },
      initialized: false
    };
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.setState({ initialized: true });
    });
  }

  componentDidUpdate(prevProps): void {
    const { navigation } = this.props;
    if (
      navigation.state.params
      && (!prevProps.navigation.state.params || prevProps.navigation.state !== navigation.state)
      && navigation.state.params.type
      && navigation.state.params.type === common.urlTypes.pairing
    ) {
      this.props.acceptInvitation(navigation.state.params);
    }
  }

  changeContactName = (e) => {
    const { name, address } = this.state.changeNameDialog.correspondent;
    this.props.setCorrespondentName({ name, address });
    this.setState({
      changeNameDialog: {
        visible: false,
        correspondent: {},
      }
    });
  };

  renderItem = (data) => {
    const { item: correspondent } = data;

    const { type } = correspondent;

    switch (type) {
      case 'bot':
        return (
          <BotItem
            navigation={this.props.navigation}
            bot={correspondent}
          />
        );
      case 'separator':
        return (
          <View style={styles.dividerView}>
            <Divider style={styles.divider} />
            <Text style={styles.dividerText}>Free Bots</Text>
          </View>
        );
      default:
        return (
          <CorrespondentItem
            setState={this.setState}
            navigation={this.props.navigation}
            correspondent={correspondent}
          />
        );
    }
  };

  render() {
    const { correspondents, unpairedBots } = this.props;
    const { changeNameDialog, initialized } = this.state;

    return (
      <SafeAreaView
        style={styles.container}
        forceInset={{ top: 'always', bottom: 'always' }}
      >
        <Header
          {...this.props}
          title='Chat'
          size='normal'
          titlePosition='left'
          right={<ActionsBar />}
        />
        {initialized && (
          <Fragment>
            {!correspondents.length && !unpairedBots.length && (
              <View style={styles.noContactsContainer}>
                <Text style={styles.noContactsText}>
                  Start adding contacts by sharing your QR code or scanning someone
                  else's!
                </Text>
              </View>
            )}
            {(!!correspondents.length || !!unpairedBots.length) && (
              <FlatList
                data={!!unpairedBots.length ? [...correspondents, listSeparator, ...unpairedBots] : correspondents}
                keyExtractor={correspondent => correspondent.address}
                renderItem={this.renderItem}
              />
            )}
            <Dialog.Container visible={changeNameDialog.visible}>
              <Dialog.Title>Change contact name</Dialog.Title>
              <TextInput
                style={styles.changeNameDialogInput}
                onChangeText={name =>
                  this.setState({
                    changeNameDialog: {
                      ...changeNameDialog,
                      correspondent: { ...changeNameDialog.correspondent, name },
                    },
                  })
                }
                value={changeNameDialog.correspondent.name}
              />
              <Dialog.Button
                label='Cancel'
                onPress={() =>
                  this.setState({
                    changeNameDialog: { ...changeNameDialog, visible: false },
                  })
                }
              />
              <Dialog.Button label='Rename' onPress={this.changeContactName} />
            </Dialog.Container>
          </Fragment>
        )}
      </SafeAreaView>
    );
  }
}
const mapStateToProps = createStructuredSelector({
  correspondents: selectCorrespondents(),
  unpairedBots: selectUnpairedBots()
});

const mapDispatchToProps = dispatch => ({
  setCorrespondentName: ({ name, address }) => dispatch(setCorrespondentName({ address, name })),
  acceptInvitation: data => dispatch(acceptInvitation({ data }))
});

ChatListScreen = connect(mapStateToProps, mapDispatchToProps)(ChatListScreen);
export default ChatListScreen;
