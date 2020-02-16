import React, { useCallback } from 'react';
import { Picker as RNPicker, View, Text } from 'react-native';

import styles from './styles';

export default Picker = ({
  style,
  onChange,
  currentValue,
  items = [],
  ...restProps
}) => {
  const onValueChanged = useCallback(
    newValue => {
      if (typeof onChange === 'function') {
        onChange(newValue);
      }
    },
    [currentValue, onChange],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{currentValue}</Text>
      <RNPicker
        mode='dropdown'
        selectedValue={currentValue}
        itemStyle={styles.itemStyle}
        onValueChange={onValueChanged}
        style={{
          ...styles.picker,
          ...style,
        }}
        {...restProps}
      >
        {items.map(({ label, value }, i) => (
          <RNPicker.Item key={i} label={label} value={value} />
        ))}
      </RNPicker>
    </View>
  );
};
