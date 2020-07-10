import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { View, Text, Image, Animated } from 'react-native';
import _ from 'lodash';
import SafeAreaView from 'react-native-safe-area-view';
import styles from './styles';

const LoadingScreen = ({ messages = [] }) => {
  const loadingAnimationValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(loadingAnimationValue, {
          toValue: 1,
          duration: 1000,
        }),
        Animated.timing(loadingAnimationValue, {
          toValue: 0,
          duration: 1000,
        }),
      ]),
    ).start();
  }, [loadingAnimationValue]);

  return (
    <SafeAreaView
      style={styles.container}
      forceInset={{ top: 'always', bottom: 'always' }}
    >
      <View style={styles.content}>
        <Animated.Image
          style={{ ...styles.logo, opacity: loadingAnimationValue }}
          resizeMethod='scale'
          source={require('../../assets/images/app-icon-1024.png')}
        />
        {messages.map(message => (
          <Text key={message}>{message}</Text>
        ))}
      </View>
    </SafeAreaView>
  );
};

LoadingScreen.propTypes = {
  messages: PropTypes.array,
};

export default LoadingScreen;
