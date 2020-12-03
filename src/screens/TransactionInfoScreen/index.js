import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { View, Text, Linking, ScrollView } from 'react-native';
import _ from 'lodash';
import Moment from 'react-moment';
import SafeAreaView from 'react-native-safe-area-view';

import { common } from '../../constants';
import Header from '../../components/Header';
import { selectExchangeRates } from './../../selectors/exchangeRates';
import { bytesToUnit } from './../../lib/utils';
import styles from './styles';

class TransactionInfoScreen extends React.Component {
  render() {
    const transaction = _.get(
      this.props,
      'navigation.state.params.transaction',
    );
    if (!transaction) {
      alert('Invalid transaction data');
    }
    const amountInDollars = (
      bytesToUnit(transaction.amount, 'GB') * this.props.exchangeRates.GBYTE_USD
    ).toFixed(2);

    var explorerUrl = `https://${
      common.network === 'testnet' ? 'testnet' : ''
    }explorer.obyte.org/#${transaction.unitId}`;

    return (
      <SafeAreaView style={styles.container}>
        <Header
          {...this.props}
          title='Transaction'
          size='compact'
          titlePosition='center'
          hasBackButton
        />
        <View style={styles.content}>
          <View style={styles.amountBlock}>
            <View style={styles.amountRow}>
              <Text style={styles.primaryAmount}>
                {transaction.type === 'SENT'
                  ? '-' + bytesToUnit(transaction.amount, 'MB')
                  : '+' + bytesToUnit(transaction.amount, 'MB')}
              </Text>
              <Text style={styles.primaryUnit}>MB</Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.secondaryAmount}>~${amountInDollars}</Text>
            </View>
          </View>
          <ScrollView style={styles.scrollContent}>
            <View style={styles.infoBlock}>
              <View style={styles.infoRow}>
                <Text style={styles.infoRowLabel}>Details</Text>
                <Text></Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoRowLabel}>
                  {transaction.type === 'SENT' ? 'To:' : 'From:'}
                </Text>
                <Text style={styles.infoRowValue}>
                  {transaction.type === 'SENT'
                    ? transaction.toAddress.join(', ')
                    : transaction.fromAddress.join(', ')}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoRowLabel}>Date:</Text>
                <Moment
                  unix
                  element={Text}
                  format={'DD/MM/YYYY HH:mm'}
                  style={styles.infoRowValue}
                >
                  {transaction.timestamp}
                </Moment>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoRowLabel}>Fees:</Text>
                <Text style={styles.infoRowValue}>
                  {transaction.totalCommission} bytes
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoRowLabel}>ID:</Text>
                <Text
                  style={{ ...styles.infoRowValue, ...styles.infoRowValueHL }}
                  onPress={() => Linking.openURL(explorerUrl)}
                >
                  {transaction.unitId}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoRowLabel}>Finality:</Text>
                {transaction.confirmed
                  ? (
                    <Text style={{ ...styles.confirmationText, ...styles.confirmedText }}>
                      Confirmed
                    </Text>
                  )
                  : (
                    <Text style={{ ...styles.confirmationText, ...styles.unConfirmedText }}>
                      Unconfirmed
                    </Text>
                  )
                }
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  exchangeRates: selectExchangeRates(),
});

const mapDispatchToProps = dispatch => ({});

TransactionInfoScreen = connect(
  mapStateToProps,
  mapDispatchToProps,
)(TransactionInfoScreen);
export default TransactionInfoScreen;
