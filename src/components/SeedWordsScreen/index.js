import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import PropTypes from 'prop-types';
import { Container, View, Text } from 'native-base';
import Button from './../Button';
import { selectSeedWordsArray } from './../../selectors/wallet';
import styles from './styles';


class SeedWordsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.next = this.next.bind(this);
    this.prev = this.prev.bind(this);
    this._getStepWords = this._getStepWords.bind(this);
    this.state = {
      step: 1,
    };
  }

  next() {
    if (this.state.step <= 3) {
      this.setState({ step: this.state.step + 1 });
    } else {
      this.props.navigation.pop();
    }
  }s

  prev() {
    if (this.state.step > 1) {
      this.setState({ step: this.state.step - 1 });
    }
  }

  _getStepWords() {
    const { step } = this.state;
    const { seedWords } = this.props;

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
  }

  render() {
    const { step } = this.state;
    return (
      <React.Fragment>
        <Container style={styles.content}>
          <View>
            <Text style={styles.helperText}>Write down the following 12 words in given order to back up your account.</Text>
          </View>
          <View>
            <Text style={styles.stepText}>{step}/4</Text>
            <Text style={styles.wordsText}>{this._getStepWords()}</Text>
          </View>
          <View>{/** placeholder for layout */}</View>
        </Container>
        <View style={styles.buttonArea}>
          {step > 1 &&
            <Button
              text={'Back'}
              style={styles.prevButton}
              textStyle={styles.prevButtonText}
              onPress={this.prev}
            />
          }
          {step === 1 && <View></View>}
          <Button
            text={step === 4 ? 'Done' : 'Next'}
            style={styles.nextButton}
            textStyle={styles.nextButtonText}
            onPress={this.next}
          />
        </View>
      </React.Fragment>
    );
  }
}

SeedWordsScreen.propTypes = {
  seedWords: PropTypes.array.isRequired,
}

const mapStateToProps = createStructuredSelector({
  seedWords: selectSeedWordsArray(),
});

const mapDispatchToProps = dispatch => ({});

SeedWordsScreen = connect(mapStateToProps, mapDispatchToProps)(SeedWordsScreen);
export default SeedWordsScreen;