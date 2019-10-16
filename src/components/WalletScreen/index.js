import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { TouchableOpacity } from 'react-native';
import { Container, View, Text, Content } from 'native-base';
import Moment from 'react-moment';
import { selectAddresses } from './../../selectors/wallet';
import { selectWalletBalances } from './../../selectors/balances';
import { selectExchangeRates } from './../../selectors/exchangeRates';
import { selectTransactions } from './../../selectors/walletHistory';
import { formatBytes, bytesToDollars } from './../../lib/Wallet';
import styles from './styles';
import Header from './../Header';
import ActionsBar from './ActionsBar';


class WalletScreen extends React.Component {
  static navigationOptions = {
    title: 'Wallet',
    header: props => <Header {...props} right={<ActionsBar />} />,
  };

  constructor(props) {
    super(props);
    this._renderTx = this._renderTx.bind(this);
  }

  _renderTx(tx, i) {
    return (
      <TouchableOpacity key={i} style={styles.transaction}>
        <View style={styles.txBoxRow}>
          <Text style={styles.txAmount}>{formatBytes(tx.amount, 'MB')} MB</Text>
          <Moment
            unix
            element={Text}
            format={'DD/MM/YYYY HH:mm'}
            style={styles.txDate}
          >{tx.timestamp}</Moment>
        </View>
        <Text style={styles.txType}>{tx.type}</Text>
        <Text style={styles.txAddress}>{tx.address.join(', ')}</Text>
      </TouchableOpacity>
    );
  }

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
        <View style={styles.txHeaderBlock}>
          <Text style={styles.txHeaderText}>Transactions</Text>
        </View>
        {this.props.transactions.length > 0 &&
          <Content style={styles.transactions}>
            {!!this.props.transactions === true &&
              this.props.transactions.map((tx, i) => this._renderTx(tx, i))
            }
          </Content>
        }
        {this.props.transactions.length === 0 &&
          <Text style={styles.txNoData}>No transactions data</Text>
        }
      </Container>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  walletBalance: selectWalletBalances(),
  walletAddresses: selectAddresses(),
  exchangeRates: selectExchangeRates(),
  transactions: selectTransactions(),
});

const mapDispatchToProps = dispatch => ({});

WalletScreen = connect(mapStateToProps, mapDispatchToProps)(WalletScreen);
export default WalletScreen;