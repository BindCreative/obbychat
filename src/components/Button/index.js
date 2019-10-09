import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity } from 'react-native';
import { Text } from 'native-base';
import styles from './styles';


let Button = props => {
  const { text, style, textStyle, ...restProps } = props;
  return (
    <TouchableOpacity
      rounded
      style={{ ...styles.button, ...style }}
      {...restProps}
    >
      <Text style={{ ...styles.buttonText, ...textStyle }}>{text}</Text>
    </TouchableOpacity>
  );
}

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