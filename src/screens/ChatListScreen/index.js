import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { ScrollView, View, TextInput } from 'react-native';
import TimeAgo from 'react-native-timeago';
import UserAvatar from 'react-native-user-avatar';
import makeBlockie from 'ethereum-blockies-base64';
import SafeAreaView from 'react-native-safe-area-view';
import { List, ListItem, Left, Right, Body, Text } from 'native-base';
import Dialog from 'react-native-dialog';

import { setCorrespondentName } from '../../actions/correspondents';
import { selectCorrespondents } from '../../selectors/messages';
import styles from './styles';
import ActionsBar from './ActionsBar';
import Header from '../../components/Header';

class ChatListScreen extends React.Component {
  constructor(props) {
    super(props);

    this.changeContactName = this.changeContactName.bind(this);
    this.state = {
      changeNameDialog: {
        visible: false,
        correspondent: {},
      },
    };
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

  render() {
    const { correspondents } = this.props;
    const { changeNameDialog } = this.state;

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
        {!correspondents.length && (
          <View style={styles.noContactsContainer}>
            <Text style={styles.noContactsText}>
              Start adding contacts by sharing your QR code or scanning someone
              else's!
            </Text>
          </View>
        )}
        {!!correspondents.length && (
          <ScrollView>
            <List style={styles.list}>
              {correspondents.map((correspondent, i) => (
                <ListItem
                  avatar
                  style={styles.listItem}
                  key={i}
                  onLongPress={() =>
                    this.setState({
                      changeNameDialog: {
                        ...changeNameDialog,
                        correspondent,
                        visible: true,
                      },
                    })
                  }
                  onPress={() =>
                    this.props.navigation.navigate('Chat', {
                      correspondent,
                    })
                  }
                >
                  <Left style={styles.listItemAvatar}>
                    <UserAvatar
                      size={42}
                      name={correspondent.name}
                      src={makeBlockie(correspondent.address)}
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
              ))}
            </List>
          </ScrollView>
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
      </SafeAreaView>
    );
  }
}
const mapStateToProps = createStructuredSelector({
  correspondents: selectCorrespondents(),
});

const mapDispatchToProps = dispatch => ({
  setCorrespondentName: ({ name, address }) =>
    dispatch(setCorrespondentName({ address, name })),
});

ChatListScreen = connect(mapStateToProps, mapDispatchToProps)(ChatListScreen);
export default ChatListScreen;
