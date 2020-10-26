import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { View, TextInput, FlatList, InteractionManager, Image, Linking } from 'react-native';
import TimeAgo from 'react-native-timeago';
import makeBlockie from 'ethereum-blockies-base64';
import SafeAreaView from 'react-native-safe-area-view';
import { List, ListItem, Left, Right, Body, Text } from 'native-base';
import Dialog from 'react-native-dialog';

import { setCorrespondentName, acceptInvitation } from '../../actions/correspondents';
import { selectCorrespondents } from '../../selectors/messages';
import styles from './styles';
import ActionsBar from './ActionsBar';
import Header from '../../components/Header';
import LoadingModal from '../../components/LoadingModal';

class ChatListScreen extends React.Component {
  constructor(props) {
    super(props);

    this.changeContactName = this.changeContactName.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.state = {
      changeNameDialog: {
        visible: false,
        correspondent: {},
      },
      initialized: false,
      invitationFetching: false
    };
  }

  runAcceptInvitation = async (data) => {
    debugger;
    this.setState({ invitationFetching: true });
    await this.props.acceptInvitation(data);
    this.setState({ invitationFetching: false });
  };

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.setState({ initialized: true });
    });
    const { navigation } = this.props;
    Linking.getInitialURL().then(url => {
      if (url) {
        const regex = /[?&]([^=#]+)=([^&#]*)/g;
        const params = {};
        let match;
        while (match = regex.exec(url)) {
          params[match[1]] = match[2];
        }
        const { address } = params;
        // this.runAcceptInvitation(address);
      }
    });
  }

  changeContactName(e) {
    const { name, address } = this.state.changeNameDialog.correspondent;
    this.props.setCorrespondentName({ name, address });
    this.setState({
      changeNameDialog: {
        visible: false,
        correspondent: {},
      },
    });
  }

  renderItem(data) {
    const { item: correspondent } = data;

    return (
      <ListItem
        avatar
        style={styles.listItem}
        onPress={() => {
          this.props.navigation.navigate('Chat', { correspondent })
        }}
        onLongPress={() => {
          this.setState({ changeNameDialog: { correspondent, visible: true } })
        }}
      >
        <Left style={styles.listItemAvatar}>
          <Image
            style={styles.userAvatar}
            name={correspondent.name}
            source={{ uri: makeBlockie(correspondent.address) }}
          />
        </Left>
        <Body style={styles.listItemBody}>
          <Text numberOfLines={1} style={styles.listItemTitle}>
            {correspondent.name}
          </Text>
          <Text numberOfLines={1} note style={styles.listItemPreview}>
            {correspondent.lastMessagePreview}
          </Text>
        </Body>
        <Right style={styles.listItemBody}>
          <Text numberOfLines={1} note style={styles.listItemTime}>
            {correspondent.lastMessageTimestamp !== undefined && (
              <TimeAgo
                time={correspondent.lastMessageTimestamp}
                interval={15000}
              />
            )}
          </Text>
        </Right>
      </ListItem>
    );
  }

  render() {
    const { correspondents } = this.props;
    const { changeNameDialog, initialized, invitationFetching } = this.state;

    return (
      <SafeAreaView
        style={styles.container}
        forceInset={{ top: 'always', bottom: 'always' }}
      >
        {invitationFetching && <LoadingModal />}
        <Header
          {...this.props}
          title='Chat'
          size='normal'
          titlePosition='left'
          right={<ActionsBar />}
        />
        {initialized && (
          <Fragment>
            {!correspondents.length && (
              <View style={styles.noContactsContainer}>
                <Text style={styles.noContactsText}>
                  Start adding contacts by sharing your QR code or scanning someone
                  else's!
                </Text>
              </View>
            )}
            {!!correspondents.length && (
              <FlatList
                data={correspondents}
                contentContainerStyle={styles.list}
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
});

const mapDispatchToProps = dispatch => ({
  setCorrespondentName: ({ name, address }) => dispatch(setCorrespondentName({ address, name })),
  acceptInvitation: data => dispatch(acceptInvitation({ data }))
});

ChatListScreen = connect(mapStateToProps, mapDispatchToProps)(ChatListScreen);
export default ChatListScreen;
