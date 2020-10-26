import React from 'react';
import * as PropTypes from 'prop-types';

import { ActivityIndicator, Text, View } from "react-native";

import {colors} from "../../constants";

import styles from "./styles";

const LoadingModal = ({ text }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={colors.cyan.main} />
    <Text style={styles.loadingText}>{text}</Text>
  </View>
);

LoadingModal.propTyes = {
  text: PropTypes.string
};

LoadingModal.defaultProps = {
  text: "Loading..."
};

export default LoadingModal;
