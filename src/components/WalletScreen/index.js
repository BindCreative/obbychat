import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { TouchableOpacity } from 'react-native';
import { Container, View, Text, Content } from 'native-base';
import { Entypo } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import Moment from 'react-moment';
import NavigationService from './../../navigation/service';
import { selectAddresses } from './../../selectors/wallet';
import { selectWalletBalances } from './../../selectors/balances';
import { selectExchangeRates } from './../../selectors/exchangeRates';
import { selectTransactions } from './../../selectors/walletHistory';
import { bytesToUnit } from './../../lib/Wallet';
import styles from './styles';
import Header from './../Header';
import ActionsBar from './ActionsBar';
import { colors } from '../../constants';


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
      txType: 'ALL',
    };
  }

  _renderTx(tx, i) {
    if (this.state.txType === 'ALL' || this.state.txType === tx.type) {
      return (
        <TouchableOpacity
          key={i}
          style={styles.transaction}
          onPress={() => NavigationService.navigate('TransactionInfo', { transaction: tx})}
        >
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
          <Text style={styles.txAddress}>
            {tx.type === 'RECEIVED' && tx.fromAddress.join(', ')}
            {tx.type === 'SENT' && tx.toAddress.join(', ')}
          </Text>
        </TouchableOpacity>
      );
    }
  }

  render() {
    const balanceInDollars = ((this.props.walletBalance / 1000000000) * this.props.exchangeRates.GBYTE_USD).toFixed(2);
    const txTypes = [
      { label: 'Received', value: 'RECEIVED' },
      { label: 'Sent', value: 'SENT' },
    ];

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
          <RNPickerSelect
            value={this.state.txType}
            onValueChange={txType => this.setState({ txType })}
            items={txTypes.map(txType => ({ label: txType.label, value: txType.value }))}
            placeholder={{ label: 'All', value: 'ALL' }}
            Icon={() => <Entypo name='chevron-small-down' size={16} color={colors.grey.main} />}
            style={{
              inputIOSContainer: {
                flexDirection: 'row',
              },
              inputAndroidContainer: {
                flexDirection: 'row',
              },
              inputIOS: {
                fontSize: 16,
                color: colors.grey.main,
              },
              inputAndroid: {
                fontSize: 16,
                color: colors.grey.main,
              },
              iconContainer: {
                position: 'relative',
                marginLeft: 15,
                justifyContent: 'center'
              }
            }}
          />
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