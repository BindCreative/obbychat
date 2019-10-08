import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import PropTypes from 'prop-types';
import { Container } from 'native-base';
import { selectSeedWordsArray } from './../../selectors/wallet';
import styles from './styles';


class SeedWordsScreen extends React.Component {
  static state = {
    page: 1,
  };

  render() {
    return (
      <Container style={styles.content}>
      {/** TODO- seedwords wizard (4 pages) */}
      </Container>
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