import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, Text } from 'react-native';
import styles from './styles';

const Button = ({ text, style, disabled, textStyle, ...restProps }) => {
  const buttonStyles = useMemo(
    () => {
      let stylesObject = {
        ...styles.button,
        ...style
      };
      if (disabled) {
        stylesObject = {
          ...stylesObject,
          ...styles.disabled
        }
      }
      return stylesObject;
    },
    [disabled, style]
  );

  return (
    <TouchableOpacity
      rounded
      style={buttonStyles}
      disabled={disabled}
      {...restProps}
    >
      <Text style={{ ...styles.buttonText, ...textStyle }}>{text}</Text>
    </TouchableOpacity>
  );
};

Button.defaultProps = {
  style: {},
  textStyle: {},
  disabled: false
};

Button.propTypes = {
  text: PropTypes.string.isRequired,
  style: PropTypes.object,
  textStyle: PropTypes.object,
  disabled: PropTypes.bool
};

export default Button;
