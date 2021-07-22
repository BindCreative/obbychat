import React, { useMemo, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { View, Text, Linking, ScrollView } from 'react-native';
import _ from 'lodash';
import Moment from 'react-moment';
import SafeAreaView from 'react-native-safe-area-view';

import { common } from '../../constants';
import Header from '../../components/Header';
import { getMaxDecimalsLength } from "../../lib/utils";
import { selectExchangeRates, selectUnitSize } from "../../selectors/main";
import { bytesToUnit } from './../../lib/utils';
import styles from './styles';

const TransactionInfoScreen = ({
  navigation, exchangeRates, unit, ...other
}) => {
  const transaction = useMemo(
    () => _.get(navigation, 'state.params.transaction'),
    [navigation]
  );

  useEffect(
    () => {
      if (!transaction) {
        alert('Invalid transaction data');
      }
    },
    [transaction]
  );

  const amountInDollars = useMemo(
    () => (bytesToUnit(transaction.amount, 'GB') * exchangeRates.GBYTE_USD).toFixed(2),
    [transaction, exchangeRates]
  );

  const explorerUrl = useMemo(
    () => `https://${common.network === 'testnet' ? 'testnet' : ''}explorer.obyte.org/#${transaction.unitId}`,
    [transaction]
  );

  const titleAmount = useMemo(
    () => {
      const mBytes = bytesToUnit(transaction.amount, unit);
      switch (transaction.type) {
        case 'SENT':
          return `-${mBytes}`;
        case 'RECEIVED':
          return `+${mBytes}`;
        default: return mBytes;
      }
    },
    [unit, transaction]
  );

  const fees = useMemo(
    () => {
      let value = bytesToUnit(transaction.totalCommission, unit);
      const maxDecimals = getMaxDecimalsLength(unit);
      value = value.toFixed(maxDecimals);
      return value;
    },
    [unit, transaction]
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        {...other}
        navigation={navigation}
        title='Transaction'
        size='compact'
        titlePosition='center'
        hasBackButton
      />
      <View style={styles.content}>
        <View style={styles.amountBlock}>
          <View style={styles.amountRow}>
            <Text style={styles.primaryAmount}>{titleAmount}</Text>
            <Text style={styles.primaryUnit}>{unit}</Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.secondaryAmount}>~${amountInDollars}</Text>
          </View>
        </View>
        <ScrollView style={styles.scrollContent}>
          <View style={styles.infoBlock}>
            <View style={styles.infoRow}>
              <Text style={styles.infoRowLabel}>Details</Text>
              <Text />
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoRowLabel}>
                {transaction.type === 'RECEIVED' ? 'From:' : 'To:'}
              </Text>
              <Text style={styles.infoRowValue}>
                {transaction.type === 'RECEIVED'
                  ? transaction.fromAddress.join(', ')
                  : transaction.toAddress.join(', ')}
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
                {`${fees} ${unit}`}
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
};

TransactionInfoScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  exchangeRates: PropTypes.object.isRequired,
  unit: PropTypes.string.isRequired
};

const mapStateToProps = createStructuredSelector({
  exchangeRates: selectExchangeRates(),
  unit: selectUnitSize()
});

export default connect(mapStateToProps, null)(TransactionInfoScreen);
