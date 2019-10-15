import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Container, View, Text, Content } from 'native-base';
import { selectWalletBalances } from './../../selectors/balances';
import { selectExchangeRates } from './../../selectors/exchangeRates';
import { formatBytes, bytesToDollars } from './../../lib/Wallet';
import styles from './styles';
import Header from './../Header';
import ActionsBar from './ActionsBar';


class WalletScreen extends React.Component {
  static navigationOptions = {
    title: 'Wallet',
    header: props => <Header {...props} right={<ActionsBar />} />,
  };

  render() {
    const balanceInDollars = bytesToDollars(this.props.walletBalance, this.props.exchangeRates.GBYTE_USD);
    return (
      <Container style={styles.content}>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceText}>{formatBytes(this.props.walletBalance, 'MB')}</Text>
          <Text style={styles.balanceUnitText}>MB</Text>
        </View>
        <View style={styles.balanceRow}>
          <Text style={styles.convertedBalanceText}>${balanceInDollars}</Text>
        </View>
        <Content></Content>
      </Container>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  walletBalance: selectWalletBalances(),
  exchangeRates: selectExchangeRates(),
});

const mapDispatchToProps = dispatch => ({});

WalletScreen = connect(mapStateToProps, mapDispatchToProps)(WalletScreen);
export default WalletScreen;