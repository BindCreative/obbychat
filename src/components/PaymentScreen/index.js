import React from 'react';
import PropTypes from 'prop-types';
import { TextInput } from 'react-native';
import { Container, View, Text } from 'native-base';
import RNPickerSelect from 'react-native-picker-select';
import { ScrollView } from 'react-native';
import Button from '../Button';
import styles from './styles';


class PaymentScreen extends React.Component {
  constructor(props) {
    super(props);
    this.onChangePrimaryValue = this.onChangePrimaryValue.bind(this);
    this.onChangeSecondaryValue = this.onChangeSecondaryValue.bind(this);
    this.onChangePrimaryUnit = this.onChangePrimaryUnit.bind(this);
    this.onChangeSecondaryUnit = this.onChangeSecondaryUnit.bind(this);
    this.state = {
      primaryUnit: 'MB',
      secondaryUnit: 'USD',
      primaryValue: 0,
      secondaryValue: 0,
      valueRatio: 2, // X:1
    };
  }

  onChangePrimaryValue(primaryValue) {
    this.setState({
      primaryValue,
      secondaryValue: primaryValue / this.state.valueRatio
    });
  }

  onChangeSecondaryValue(secondaryValue) {
    this.setState({
      secondaryValue,
      primaryValue: secondaryValue * this.state.valueRatio
    });
  }

  onChangePrimaryUnit(primaryUnit) {
    this.setState({ primaryUnit });
  }

  onChangeSecondaryUnit(secondaryUnit) {
    this.setState({ secondaryUnit });
  }

  render() {
    const {
      primaryValue,
      secondaryValue,
      primaryUnit,
      secondaryUnit,
    } = this.state;
    
    return (
      <Container style={styles.content}>
        <View style={styles.addressBox}>
          <Text style={styles.addressText}>
          {this.props.method === 'request' ? 'From: ' : 'To: ' }
          {this.props.navigation.state.params.walletAddress}
          </Text>
        </View>
        <View style={{ ...styles.field, ...styles.primaryField }}>
          <TextInput
            style={styles.input}
            onChangeText={value => this.onChangePrimaryValue(value)}
            value={(primaryValue === 0) ? '' : String(primaryValue)}
            keyboardType='decimal-pad'
            autoFocus={true}
          />
          <RNPickerSelect
            value={primaryUnit}
            onValueChange={value => this.onChangePrimaryUnit(value)}
            items={[
              { label: 'bytes', value: 'b' },
              { label: 'KB', value: 'KB' },
              { label: 'MB', value: 'MB' },
              { label: 'GB', value: 'GB' },
            ]}
          />
        </View>
        <View style={styles.field}>
          <TextInput
            style={styles.input}
            onChangeText={value => this.onChangeSecondaryValue(value)}
            value={(secondaryValue === 0) ? '' : String(secondaryValue)}
            keyboardType='decimal-pad'
          />
          <RNPickerSelect
            value={secondaryUnit}
            onValueChange={value => this.onChangeSecondaryUnit(value)}
            items={[
              { label: 'USD', value: 'USD' },
            ]}
            disabled
          />
        </View>
        <Button
          text={this.props.method === 'request' ? 'Request' : 'Send' }
          style={styles.confirmButton}
        />
      </Container>
    );
  }
}

PaymentScreen.defaultProps = {
  method: 'send', // send|request
};

PaymentScreen.propTypes = {
  method: PropTypes.string.isRequired,
};

export default PaymentScreen;