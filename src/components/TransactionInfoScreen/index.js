import React from 'react';
import { Container, Text, View, Content } from 'native-base';
import _ from 'lodash';
import styles from './styles';


class TransactionInfoScreen extends React.Component {

  render() {
    if (!_.get(this.props, 'navigation.state.params.transaction')) {
      alert('Invalid transaction data');
    }
    const { transaction } = this.props.navigation.state.params;
    return (
      <Container style={styles.container}>
        <View>
          <View>
            <Text>
              {transaction.type === 'SENT' ? -transaction.amount : transaction.amount}
            </Text>
            <Text>MB</Text>
          </View>
          <View>
            <Text>
              ${transaction.type === 'SENT' ? -transaction.amount : transaction.amount}
            </Text>
          </View>
        </View>
        <Content>
          <View>
            <Text>Details</Text>
            <Text></Text>
          </View>
          <View>
            <Text>{transaction.type === 'SENT' ? 'To:' : 'From:'}</Text>
            <Text>{transaction.type === 'SENT' ? transaction.toAddress.join(', ') : transaction.fromAddress.join(', ')}</Text>
          </View>
          <View>
            <Text>Timestamp:</Text>
            <Text>{transaction.timestamp}</Text>
          </View>
          <View>
            <Text>Fees:</Text>
            <Text>{transaction.totalCommission}</Text>
          </View>
          <View>
            <Text>ID:</Text>
            <Text>{transaction.unitId}</Text>
          </View>
        </Content>
      </Container>
    );
  }
}

export default TransactionInfoScreen;