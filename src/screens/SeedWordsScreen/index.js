import React, { useState, useMemo } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import PropTypes from 'prop-types';
import { View, Text } from 'react-native';

import Button from '../../components/Button';
import { selectSeedWordsArray } from './../../selectors/secure';
import styles from './styles';

const SeedWordsScreen = ({
  navigation, seedWords, handleFinish, handleSKip
}) => {
  const [step, setStep] = useState(1);

  const next = () => {
    if (step <= 3) {
      setStep(step + 1);
    } else {
      if (handleFinish) {
        handleFinish();
      } else {
        navigation.pop();
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

  const stepWords = useMemo(
    () => {
      switch (step) {
        case 1:
          return `${seedWords[0]} ${seedWords[1]} ${seedWords[2]}`;
        case 2:
          return `${seedWords[3]} ${seedWords[4]} ${seedWords[5]}`;
        case 3:
          return `${seedWords[6]} ${seedWords[7]} ${seedWords[8]}`;
        case 4:
          return `${seedWords[9]} ${seedWords[10]} ${seedWords[11]}`;
        default:
          return '';
      }
    },
    [step, seedWords]
  );

  return (
    <React.Fragment>
      <View style={styles.content}>
        <View>
          <Text style={styles.helperText}>
            Write down the following 12 words in given order to back up your
            account.
          </Text>
        </View>
        <View>
          <Text style={styles.stepText}>{step}/4</Text>
          <Text style={styles.wordsText}>{stepWords}</Text>
        </View>
        <View>{/** placeholder for layout */}</View>
      </View>
      <View style={styles.buttonArea}>
        <Button
          text={'Back'}
          style={styles.prevButton}
          textStyle={styles.prevButtonText}
          onPress={prev}
          disabled={step === 1 && !navigation}
        />
        <Button
          text={step === 4 ? 'Done' : 'Next'}
          style={styles.nextButton}
          textStyle={styles.nextButtonText}
          onPress={next}
        />
        {handleSKip && (
          <Button
            text={'Skip'}
            style={{ ...styles.nextButton, ...styles.skipButton }}
            textStyle={styles.nextButtonText}
            onPress={handleSKip}
          />
        )}
      </View>
    </React.Fragment>
  );
};

SeedWordsScreen.propTypes = {
  seedWords: PropTypes.array.isRequired,
  navigation: PropTypes.object.isRequired,
  handleFinish: PropTypes.func,
  handleSKip: PropTypes.func
};

SeedWordsScreen.defaultProps = {
  handleFinish: null,
  handleSKip: null
};

const mapStateToProps = createStructuredSelector({
  seedWords: selectSeedWordsArray(),
});

export default connect(mapStateToProps, null)(SeedWordsScreen);
