import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { useDispatch } from "react-redux";

import { acceptInvitation } from './../../actions/correspondents';

import { View, Platform, KeyboardAvoidingView, TextInput, Clipboard, TouchableOpacity, Alert } from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';

import Header from '../../components/Header';
import Button from './../../components/Button';
import NfcReader from '../../components/NfcReader';
import CopyIcon from './../../assets/images/icon-copy.svg';

import { REGEX_PAIRING } from "../../lib/messaging";

import styles from './styles';

const PairInputScreen = ({ navigation, backRoute }) => {
  const dispatch = useDispatch();
  const [address, setAddress] = useState("");

  const onChangeAddress = (value) => {
    setAddress(value);
  };

  const handleAddContact = () => {
    if (REGEX_PAIRING.test(address)) {
      dispatch(acceptInvitation({ data: address }));
    } else {
      Alert.alert("Warning", "Wrong pairing code");
    }
  };

  const pasteAddress = async () => {
    let copiedAddress = await Clipboard.getString();
    setAddress(copiedAddress);
  };

  return (
    <SafeAreaView
      style={styles.container}
      forceInset={{ top: 'always', bottom: 'always' }}
    >
      <KeyboardAvoidingView style={styles.content}>
        <Header
          navigation={navigation}
          size='compact'
          titlePosition='center'
          title="Add contact"
          backRoute={backRoute}
          hasBackButton
        />
        <View style={styles.addressInputBox}>
          <TextInput
            style={styles.addressInput}
            value={address}
            onChangeText={onChangeAddress}
            autoCorrect={false}
          />
          {!address && (
            <View style={styles.addressInputPaste}>
              <TouchableOpacity onPress={pasteAddress}>
                <CopyIcon
                  style={styles.addressInputPasteIcon}
                  width={19}
                  height={22}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View style={styles.nfcReaderContainer}>
          <NfcReader />
        </View>
        <Button
          text='Add contact'
          onPress={handleAddContact}
          style={styles.addButton}
          disabled={!address.length}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

PairInputScreen.defaultProps = {
  backRoute: null,
};

PairInputScreen.propTypes = {
  backRoute: PropTypes.string,
};

export default PairInputScreen;
