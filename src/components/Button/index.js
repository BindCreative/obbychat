import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity } from 'react-native';
import { Text } from 'native-base';
import styles from './styles';


let Button = props => {
  const { text, style, ...restProps } = props;
  return (
    <TouchableOpacity
      rounded
      style={{ ...styles.button, ...style }}
      {...restProps}
    >
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
}

Button.propTypes = {
  text: PropTypes.string.isRequired,
  style: PropTypes.object,
};

export default Button;