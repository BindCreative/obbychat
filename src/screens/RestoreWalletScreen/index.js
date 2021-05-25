import React, { useState, useEffect, useMemo, Fragment } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from "react-redux";

import { View, Text, TextInput, KeyboardAvoidingView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';

import Mnemonic from 'bitcore-mnemonic';

import { restoreAccount } from "../../actions/device";

import Button from '../../components/Button';

import styles from './styles';

const RestoreWalletScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [seedWords, setSeedWords] = useState([]);
  const [stepWords, setStepWords] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const mnemonic = useMemo(
    () => new Mnemonic(),
    []
  );

  const next = () => {
    const newSeedWords = [...seedWords];
    newSeedWords[step - 1] = stepWords;
    setSeedWords(newSeedWords);
    if (step <= 3) {
      setStep(step + 1);
    } else {
      const wordsArray = newSeedWords.reduce((counter, words) => [...counter, ...words], []);
      const wordsString = wordsArray.join(" ");
      if (Mnemonic.isValid(wordsString)) {
        Alert.alert(
          "Warning",
          "Next step will remove all data from current wallets. Are you sure to continue?",
          [
            { text: 'No', style: 'cancel' },
            { text: 'Yes', onPress: () => dispatch(restoreAccount(wordsString)) }
          ]
        );
      } else {
        Alert.alert(
          "Warning",
          "Wrong word list. Please check the correctness of the words and their order in the list, and try again"
        );
      }
    }
  };

  const prev = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.pop();
    }
  };

  useEffect(
    () => {
      setStepWords(seedWords[step - 1] || [])
    },
    [step, seedWords]
  );

  const autocompleteVariants = useMemo(
    () => {
      let result = [];
      if (inputValue) {
        mnemonic.wordlist.some((word) => {
          if (word.includes(inputValue.toLowerCase())) {
            result.push(word);
            if (result.length >= 6) {
              return true;
            }
          }
          return false;
        });
      }
      return result;
    },
    [inputValue, stepWords]
  );

  const addToStepWords = (word) => {
    setStepWords([...stepWords, word]);
    setInputValue("");
  };

  const removeFromStepWords = (word) => {
    const newWords = [...stepWords];
    newWords.splice(newWords.indexOf(word), 1);
    setStepWords(newWords);
  };

  return (
    <Fragment
      style={styles.container}
      forceInset={{ top: 'always', bottom: 'always' }}
    >
      <KeyboardAvoidingView style={styles.content} behavior="height">
        <View>
          <Text style={styles.helperText}>
            Write down the following 12 words in given order to back up your
            account.
          </Text>
        </View>
        <View>
          <View style={styles.stepWordsContainer}>
            {stepWords.map(word => (
              <TouchableOpacity
                key={word}
                onPress={() => removeFromStepWords(word)}
              >
                <View style={styles.stepWordsVariant}>
                  <Text style={styles.stepWordsVariantText}>{word}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.wordInputBox}>
            <TextInput
              style={styles.wordInput}
              value={inputValue}
              onChangeText={setInputValue}
              autoFocus={true}
              autoCorrect={false}
              autoCapitalize="none"
              editable={stepWords.length < 3}
            />
          </View>
          <View style={styles.autocompleteContainer}>
            {autocompleteVariants.map(word => (
              <TouchableOpacity
                key={word}
                onPress={() => addToStepWords(word)}
              >
                <View style={styles.autocompleteVariant}>
                  <Text style={styles.autocompleteVariantText}>{word}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.stepText}>{step}/4</Text>
        </View>
        <View>{/** placeholder for layout */}</View>
      </KeyboardAvoidingView>
      <View style={styles.buttonArea}>
        <Button
          text={'Back'}
          style={styles.prevButton}
          textStyle={styles.prevButtonText}
          onPress={prev}
        />
        <Button
          text={'Next'}
          style={styles.nextButton}
          textStyle={styles.nextButtonText}
          onPress={next}
          disabled={stepWords.length !== 3}
        />
      </View>
    </Fragment>
  );
};

RestoreWalletScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};

export default RestoreWalletScreen;
