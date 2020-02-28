import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import {
  TouchableOpacity,
  Text,
  View,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import ContentLoader, { Rect } from 'react-content-loader/native';
import Moment from 'react-moment';
import SafeAreaView from 'react-native-safe-area-view';

import Picker from '../../components/Picker';
import NavigationService from './../../navigation/service';
import { loadWalletBalances } from './../../actions/balances';
import {
  selectWalletBalances,
  selectBalancesLoading,
} from './../../selectors/balances';
import { selectExchangeRates } from './../../selectors/exchangeRates';
import { selectTransactions } from './../../selectors/walletHistory';
import { bytesToUnit } from './../../lib/utils';
import styles from './styles';
import Header from '../../components/Header';
import ActionsBar from './ActionsBar';
import { colors } from '../../constants';

const TX_TYPES = [
  { label: 'All', value: 'ALL' },
  { label: 'Received', value: 'RECEIVED' },
  { label: 'Sent', value: 'SENT' },
];

class WalletScreen extends React.Component {
  constructor(props) {
    super(props);
    this.renderTx = this.renderTx.bind(this);
    this.renderLoadingScreen = this.renderLoadingScreen.bind(this);
    this.state = {
      unit: 'MB',
      txType: 'ALL',
    };
  }

  renderTx(tx, i) {
    if (this.state.txType === 'ALL' || this.state.txType === tx.type) {
      return (
        <TouchableOpacity
          key={i}
          style={styles.transaction}
          onPress={() =>
            NavigationService.navigate('TransactionInfo', { transaction: tx })
          }
        >
          <View style={styles.txBoxRow}>
            <Text style={styles.txAmount}>
              {bytesToUnit(tx.amount, this.state.unit)} {this.state.unit}
            </Text>
            <Moment
              unix
              element={Text}
              format={'DD/MM/YYYY HH:mm'}
              style={styles.txDate}
            >
              {tx.timestamp}
            </Moment>
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

  renderLoadingScreen() {
    return (
      <SafeAreaView
        forceInset={{ top: 'always', bottom: 'always' }}
        style={styles.container}
      >
        <ContentLoader
          width={Dimensions.get('window').width - 10}
          height={Dimensions.get('window').height * 0.75}
        >
          <Rect x='10' y='10' rx='4' ry='4' width='300' height='40' />
          <Rect x='10' y='62' rx='4' ry='4' width='240' height='32' />
          <Rect
            x='10'
            y='150'
            rx='4'
            ry='4'
            width={Dimensions.get('window').width}
            height='100'
          />
          <Rect
            x='10'
            y='260'
            rx='4'
            ry='4'
            width={Dimensions.get('window').width}
            height='100'
          />
          <Rect
            x='10'
            y='370'
            rx='4'
            ry='4'
            width={Dimensions.get('window').width}
            height='100'
          />
          <Rect
            x='10'
            y='480'
            rx='4'
            ry='4'
            width={Dimensions.get('window').width}
            height='100'
          />
        </ContentLoader>
      </SafeAreaView>
    );
  }

  render() {
    const { loading, loadBalances } = this.props;
    const balanceInDollars = (
      bytesToUnit(this.props.walletBalance, 'GB') *
      this.props.exchangeRates.GBYTE_USD
    ).toFixed(2);

    return (
      <SafeAreaView
        style={styles.container}
        forceInset={{ top: 'always', bottom: 'always' }}
      >
        <Header
          {...this.props}
          title='Wallet'
          size='normal'
          titlePosition='left'
          right={<ActionsBar />}
        />
        {loading && this.renderLoadingScreen()}
        {!loading && (
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={loadBalances} />
            }
          >
            <View style={styles.content}>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceText}>
                  {bytesToUnit(this.props.walletBalance, this.state.unit)}
                </Text>
                <Text style={styles.balanceUnitText}>{this.state.unit}</Text>
              </View>
              <View style={styles.balanceRow}>
                <Text style={styles.convertedBalanceText}>
                  ${balanceInDollars}
                </Text>
              </View>
              <View style={styles.txHeaderBlock}>
                <Text style={styles.txHeaderText}>Transactions</Text>
                <Picker
                  onPress={() => alert(1)}
                  currentValue={this.state.txType}
                  onValueChange={txType => this.setState({ txType })}
                  items={TX_TYPES}
                />
              </View>
              {this.props.transactions.length > 0 && (
                <View style={styles.transactions}>
                  {!!this.props.transactions === true &&
                    this.props.transactions.map((tx, i) =>
                      this.renderTx(tx, i),
                    )}
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  walletBalance: selectWalletBalances(),
  exchangeRates: selectExchangeRates(),
  transactions: selectTransactions(),
  loading: selectBalancesLoading(),
});

const mapDispatchToProps = dispatch => ({
  loadBalances: () => dispatch(loadWalletBalances()),
});

WalletScreen = connect(mapStateToProps, mapDispatchToProps)(WalletScreen);
export default WalletScreen;