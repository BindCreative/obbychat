import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Container, Text, View, Content } from 'native-base';
import _ from 'lodash';
import Moment from 'react-moment';
import { selectExchangeRates } from './../../selectors/exchangeRates';
import { bytesToUnit } from './../../lib/Wallet';
import styles from './styles';


class TransactionInfoScreen extends React.Component {

  render() {
    if (!_.get(this.props, 'navigation.state.params.transaction')) {
      alert('Invalid transaction data');
    }
    const { transaction } = this.props.navigation.state.params;
    const amountInDollars = (bytesToUnit(transaction.amount, 'GB') * this.props.exchangeRates.GBYTE_USD).toFixed(2);

    return (
      <Container style={styles.container}>
        <Content contentContainerStyle={styles.content}>
          <View style={styles.amountBlock}>
            <View style={styles.amountRow}>
              <Text style={styles.primaryAmount}>
                {transaction.type === 'SENT' ? '-' + bytesToUnit(transaction.amount, 'MB') : '+' + bytesToUnit(transaction.amount, 'MB')}
              </Text>
              <Text style={styles.primaryUnit}>MB</Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.secondaryAmount}>
                ~${amountInDollars}
              </Text>
            </View>
          </View>
          <View style={styles.infoBlock}>
            <View style={styles.infoRow}>
              <Text style={styles.infoRowLabel}>Details</Text>
              <Text></Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoRowLabel}>{transaction.type === 'SENT' ? 'To:' : 'From:'}</Text>
              <Text style={styles.infoRowValue}>{transaction.type === 'SENT' ? transaction.toAddress.join(', ') : transaction.fromAddress.join(', ')}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoRowLabel}>Date:</Text>
              <Moment
                unix
                element={Text}
                format={'DD/MM/YYYY HH:mm'}
                style={styles.infoRowValue}
              >{transaction.timestamp}</Moment>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoRowLabel}>Fees:</Text>
              <Text style={styles.infoRowValue}>{transaction.totalCommission} bytes</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoRowLabel}>ID:</Text>
              <Text style={{ ...styles.infoRowValue, ...styles.infoRowValueHL }}>{transaction.unitId}</Text>
            </View>
          </View>
        </Content>
      </Container>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  exchangeRates: selectExchangeRates(),
});

const mapDispatchToProps = dispatch => ({});

TransactionInfoScreen = connect(mapStateToProps, mapDispatchToProps)(TransactionInfoScreen);
export default TransactionInfoScreen;