import React, { useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import RNActionSheet from 'react-native-actionsheet';

import styles from './styles';

export default ActionSheet = ({
  onChange,
  currentValue,
  items = [],
  ...restProps
}) => {
  const actionSheet = useRef();
  const options = [...items.map(item => item.label), 'Cancel'];

  const handleOpenActionSheet = useCallback(() => {
    if (actionSheet) {
      actionSheet.current.show();
    }
  }, [actionSheet]);

  const onValueChanged = useCallback(
    i => {
      if (typeof onChange === 'function' && i !== options.length - 1) {
        onChange(items[i].value);
      }
    },
    [options, currentValue, onChange],
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleOpenActionSheet}>
        <Text style={styles.label}>{currentValue}</Text>
      </TouchableOpacity>
      <RNActionSheet
        ref={actionSheet}
        options={options}
        cancelButtonIndex={options.length ? options.length - 1 : 0}
        destructiveButtonIndex={options.length ? options.length - 1 : 0}
        onPress={onValueChanged}
        {...restProps}
      />
    </View>
  );
};
