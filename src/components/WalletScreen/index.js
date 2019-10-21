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
import { bytesToUnit } from './../../lib/Wallet';
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
    this.state = {
      unit: 'MB',
    };
  }

  _renderTx(tx, i) {
    return (
      <TouchableOpacity key={i} style={styles.transaction}>
        <View style={styles.txBoxRow}>
          <Text style={styles.txAmount}>{bytesToUnit(tx.amount, this.state.unit)} {this.state.unit}</Text>
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
    const balanceInDollars = ((this.props.walletBalance / 1000000000) * this.props.exchangeRates.GBYTE_USD).toFixed(2);

    return (
      <Container style={styles.content}>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceText}>{bytesToUnit(this.props.walletBalance, this.state.unit)}</Text>
          <Text style={styles.balanceUnitText}>{this.state.unit}</Text>
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