import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import _ from 'lodash';

import Chat from './Chat';
import Bot from './Bot';

const ChatScreen = ({ navigation, backRoute }) => {
  const correspondent = useMemo(
    () => _.get(navigation, 'state.params.correspondent'),
    []
  );

  switch (correspondent.type) {
    case 'bot':
      return (
        <Bot
          correspondent={correspondent}
          backRoute={backRoute}
          navigation={navigation}
        />
      );
    default: return (
      <Chat
        correspondent={correspondent}
        backRoute={backRoute}
        navigation={navigation}
      />
    );
  }
};

ChatScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  backRoute: PropTypes.string.isRequired
};

export default ChatScreen;
