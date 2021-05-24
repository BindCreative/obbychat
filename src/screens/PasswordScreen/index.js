import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { useDispatch, connect } from "react-redux";
import { createStructuredSelector } from 'reselect';

import { View, Platform, KeyboardAvoidingView, TextInput, Clipboard, TouchableOpacity, Alert, Text } from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';

import { createInitialWalletStart, initWallet } from "../../actions/wallet";
import { setPasswordProtected } from "../../actions/secure";

import { selectSeedWords, selectPasswordProtected } from "../../selectors/secure";

import Header from '../../components/Header';
import Button from '../../components/Button';

import IconVisible from '../../assets/images/icon-visible.svg';
import IconVisibleOff from '../../assets/images/icon-visible-off.svg';
import IconSecurity from '../../assets/images/icon-security.svg';

import styles from './styles';
import { colors } from '../../constants';

const PasswordScreen = ({ navigation, seedWords, passwordProtected }) => {
  const dispatch = useDispatch();
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const init = () => {
    if (!!password) {
      dispatch(setPasswordProtected());
    }
    dispatch(initWallet({ password }));
  };

  return (
    <SafeAreaView style={styles.container} forceInset={{ top: 'always', bottom: 'always' }}>
      <KeyboardAvoidingView style={styles.content} behavior="height">
        <View style={styles.titleContainer}>
          <IconSecurity width={26} height={26} fill={colors.cyan.main} />
          <Text style={styles.titleText}>PASSPHRASE</Text>
        </View>
        <View style={styles.descriptionContainer}>
          <Text>
            Obby Chat supports passphrase. If you don't know what this is, or if your wallet does not have a passphrase, leave this field blank, and press Next
          </Text>
        </View>
        <View style={styles.addressInputBox}>
          <TextInput
            type="password"
            style={styles.addressInput}
            value={password}
            onChangeText={setPassword}
            autoCorrect={false}
            secureTextEntry={!passwordVisible}
            placeholder="Passphrase"
          />
          <View style={styles.addressInputPaste}>
            <TouchableOpacity onPress={togglePasswordVisibility}>
              {passwordVisible
                ? (
                  <IconVisibleOff
                    style={styles.addressInputPasteIcon}
                    width={26}
                    height={26}
                    fill={colors.grey.dark}
                  />
                )
                : (
                  <IconVisible
                    style={styles.addressInputPasteIcon}
                    width={26}
                    height={26}
                    fill={colors.grey.dark}
                  />
                )}
            </TouchableOpacity>
          </View>
        </View>
        <Button
          text='Next'
          onPress={init}
          style={styles.addButton}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

PasswordScreen.propTypes = {
  seedWords: PropTypes.string.isRequired,
  navigation: PropTypes.object.isRequired,
  passwordProtected: PropTypes.bool.isRequired
};

const mapStateToProps = createStructuredSelector({
  seedWords: selectSeedWords(),
  passwordProtected: selectPasswordProtected()
});

export default connect(mapStateToProps, null)(PasswordScreen);
