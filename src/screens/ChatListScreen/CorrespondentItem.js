import React from 'react';
import PropTypes from 'prop-types';

import { View, TextInput, FlatList, InteractionManager, Image, Linking, Text } from 'react-native';
import TimeAgo from 'react-native-timeago';
import makeBlockie from 'ethereum-blockies-base64';

import styles from './styles';
import {List} from "react-native-paper";

const CorrespondentItem = ({ correspondent, navigation, setState }) => (
  <List.Item
    key={correspondent.address}
    style={styles.listItem}
    onPress={() => {
      navigation.navigate('Chat', { correspondent })
    }}
    onLongPress={() => {
      setState({ changeNameDialog: { correspondent, visible: true } })
    }}
    left={() => (
      <View style={styles.userAvatarContainer}>
        <Image
          style={styles.userAvatar}
          name={correspondent.name}
          source={{ uri: makeBlockie(correspondent.address) }}
        />
      </View>
    )}
    title={correspondent.name}
    titleStyle={styles.listItemTitle}
    description={() => (
      <View style={styles.descriptionContainer}>
        <Text numberOfLines={1} style={styles.listItemPreview}>{correspondent.lastMessagePreview}</Text>
        <Text numberOfLines={1} note style={styles.listItemTime}>
          {correspondent.lastMessageTimestamp !== undefined && (
            <TimeAgo
              time={correspondent.lastMessageTimestamp}
              interval={15000}
            />
          )}
        </Text>
      </View>
    )}
  />
);

CorrespondentItem.propTypes = {
  correspondent: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  setState: PropTypes.func.isRequired
};

export default CorrespondentItem;
