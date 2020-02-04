import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, Text } from 'react-native';
import styles from './styles';

let Button = ({ text, style, disabled, textStyle, ...restProps }) => {
  return (
    <TouchableOpacity
      rounded
      style={{ ...styles.button, ...style }}
      {...restProps}
    >
      <Text style={{ ...styles.buttonText, ...textStyle }}>{text}</Text>
    </TouchableOpacity>
  );
};

Button.defaultProps = {
  style: {},
  textStyle: {},
};

Button.propTypes = {
  text: PropTypes.string.isRequired,
  style: PropTypes.object,
  textStyle: PropTypes.object,
};

export default Button;
