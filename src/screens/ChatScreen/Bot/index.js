import React, { useState } from 'react';
import * as PropTypes from "prop-types";
import { useDispatch } from "react-redux";

import { Text, View } from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';

import { acceptInvitation } from '../../../actions/correspondents';
import { botPairSuccess } from "../../../actions/messages";

import Header from '../../../components/Header';
import Button from '../../../components/Button';

import styles from './styles';

const BotScreen = ({
  correspondent, backRoute, navigation
}) => {
  const dispatch = useDispatch();
  const [fetching, setFetching] = useState(false);

  const pairChatBot = () => {
    setFetching(true);
    const { id, pairing_code } = correspondent;
    dispatch(acceptInvitation({ data: pairing_code }));
    dispatch(botPairSuccess(id))
  };

  return (
    <SafeAreaView
      style={styles.container}
      forceInset={{ top: 'always', bottom: 'always' }}
    >
      <Header
        hasBackButton
        hasBorder
        backRoute={backRoute}
        size='compact'
        titlePosition='left'
        title={correspondent.name}
        navigation={navigation}
      />
      <View style={styles.contentContainer}>
        <Text>
          {correspondent.description}
        </Text>
        <Button
          text="Add Chatbot"
          onPress={pairChatBot}
          disabled={fetching}
        />
      </View>
    </SafeAreaView>
  );
};

BotScreen.propTypes = {
  correspondent: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  backRoute: PropTypes.string.isRequired
};

export default BotScreen;
