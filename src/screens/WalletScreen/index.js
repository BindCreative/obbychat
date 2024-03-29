import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import {
  TouchableOpacity,
  Text,
  View,
  FlatList,
  RefreshControl,
  Dimensions,
  InteractionManager
} from 'react-native';
import ContentLoader, { Rect } from 'react-content-loader/native';
import Moment from 'react-moment';
import SafeAreaView from 'react-native-safe-area-view';

import ActionSheet from '../../components/ActionSheet';
import NavigationService from './../../navigation/service';
import { loadWalletBalances } from './../../actions/balances';
import { loadWalletHistory } from './../../actions/walletHistory';

import {
  selectWalletBalances,
  selectBalancesLoading,
  selectExchangeRates,
  selectTransactions,
  selectUnitSize
} from "../../selectors/main";

import { bytesToUnit } from './../../lib/utils';

import styles from './styles';

import Header from '../../components/Header';
import ActionsBar from './ActionsBar';

const TX_TYPES = [
  { label: 'All', value: 'ALL' },
  { label: 'Received', value: 'RECEIVED' },
  { label: 'Sent', value: 'SENT' },
];

const unconfirmedStatuses = {
  'MOVED': 'MOVING',
  'SENT': 'SENDING',
  'RECEIVED': 'RECEIVING'
};

class WalletScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      unit: 'MB',
      txType: 'ALL',
    };
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.setState({ initialized: true });
    });
  }

  renderTx = (data) => {
    const { item: tx } = data;
    const { unit } = this.props;
    const { txType } = this.state;

    if (txType === 'ALL' || txType === tx.type) {
      return (
        <TouchableOpacity
          style={styles.transaction}
          onPress={() =>
            NavigationService.navigate('TransactionInfo', { transaction: tx })
          }
        >
          <View style={styles.txBoxRow}>
            <Text style={styles.txAmount}>
              {tx.asset === 'base' ? `${bytesToUnit(tx.amount, unit)} ${unit}` : tx.amount}
            </Text>
            <Moment
              unix
              element={Text}
              format={'YYYY-MM-DD hh:mm'}
              style={styles.txDate}
            >
              {tx.timestamp}
            </Moment>
          </View>
          <Text style={styles.txType}>{
            tx.confirmed
              ? tx.type
              : unconfirmedStatuses[tx.type]
          }</Text>
          <Text style={styles.txAddress}>
            {tx.type === 'RECEIVED' && tx.fromAddress.join(', ')}
            {(tx.type === 'SENT' || tx.type === 'MOVED') && tx.toAddress.join(', ')}
          </Text>
        </TouchableOpacity>
      );
    }
  };

  renderLoadingScreen = () => (
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
        <Rect x='10' y='150' rx='4' ry='4' width={Dimensions.get('window').width} height='100' />
        <Rect x='10' y='260' rx='4' ry='4' width={Dimensions.get('window').width} height='100' />
        <Rect x='10' y='370' rx='4' ry='4' width={Dimensions.get('window').width} height='100' />
        <Rect x='10' y='480' rx='4' ry='4' width={Dimensions.get('window').width} height='100' />
      </ContentLoader>
    </SafeAreaView>
  );

  renderHeader = () => {
    const { walletBalance, unit } = this.props;
    const balanceInDollars = (
      bytesToUnit(walletBalance, 'GB') *
      this.props.exchangeRates.GBYTE_USD
    ).toFixed(2);

    return (
      <React.Fragment>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceText}>
            {bytesToUnit(walletBalance, unit)}
          </Text>
          <Text style={styles.balanceUnitText}>{unit}</Text>
        </View>
        <View style={styles.balanceRow}>
          <Text style={styles.convertedBalanceText}>${balanceInDollars}</Text>
        </View>
        <View style={styles.txHeaderBlock}>
          <Text style={styles.txHeaderText}>Transactions</Text>
          <ActionSheet
            currentValue={this.state.txType}
            onChange={txType => this.setState({ txType })}
            items={TX_TYPES}
          />
        </View>
      </React.Fragment>
    );
  };

  render() {
    const { loading, loadBalances, transactions } = this.props;

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
        {this.state.initialized && (
          <Fragment>
            {loading && this.renderLoadingScreen()}
            {!loading && (
              <FlatList
                data={transactions}
                contentContainerStyle={styles.content}
                keyExtractor={tx => tx.unitId}
                renderItem={this.renderTx}
                ListHeaderComponent={this.renderHeader}
                refreshControl={
                  <RefreshControl refreshing={loading} onRefresh={loadBalances} />
                }
              />
            )}
          </Fragment>
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
  unit: selectUnitSize()
});

const mapDispatchToProps = dispatch => ({
  loadBalances: () => {
    dispatch(loadWalletBalances());
    dispatch(loadWalletHistory());
  },
});

WalletScreen = connect(mapStateToProps, mapDispatchToProps)(WalletScreen);
export default WalletScreen;
