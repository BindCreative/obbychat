import React from 'react';
import PropTypes from 'prop-types';

import { View, TextInput, FlatList, InteractionManager, Image, Linking, Text } from 'react-native';

import styles from './styles';
import { List } from "react-native-paper";

const BotItem = ({ bot, navigation }) => (
  <List.Item
    key={bot.id}
    style={styles.listItem}
    onPress={() => {
      navigation.navigate('Chat', { correspondent: bot })
    }}
    title={bot.name}
    titleStyle={styles.listItemTitle}
    description={() => (
      <View style={styles.descriptionContainer}>
        <Text numberOfLines={1} style={styles.listItemPreview}>{bot.description}</Text>
      </View>
    )}
  />
);

BotItem.propTypes = {
  correspondent: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired
};

export default BotItem;
