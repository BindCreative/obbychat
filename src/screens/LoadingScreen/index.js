import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { View, Text, Image, Animated, ActivityIndicator, Platform } from 'react-native';
import _ from 'lodash';
import SafeAreaView from 'react-native-safe-area-view';
import styles from './styles';

const LoadingScreen = () => (
  <SafeAreaView
    style={styles.container}
    forceInset={{ top: 'always', bottom: 'always' }}
  >
    <View style={styles.content}>
      <Image
        style={styles.logo}
        resizeMethod='scale'
        source={require('./../../assets/images/loading.gif')}
      />
      <Text>Loading...</Text>
    </View>
  </SafeAreaView>
);

LoadingScreen.propTypes = {
  messages: PropTypes.array,
};

export default LoadingScreen;
