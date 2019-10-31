import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { TextInput, Clipboard, KeyboardAvoidingView } from 'react-native';
import { View, Text } from 'native-base';
import RNPickerSelect from 'react-native-picker-select';
import CopyIcon from './../../assets/images/icon-copy.svg';
import _ from 'lodash';
import { isValidAddress } from 'obyte/lib/utils';
import Button from '../Button';
import styles from './styles';
import { colors } from '../../constants';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { selectExchangeRates } from './../../selectors/exchangeRates';
import { sendPaymentStart } from './../../actions/wallet';
import { availableUnits, unitToBytes } from './../../lib/Wallet';


class PaymentScreen extends React.Component {
  constructor(props) {
    super(props);
    this.changeValue = this.changeValue.bind(this);
    this.changePrimaryUnit = this.changePrimaryUnit.bind(this);
    this.changeSecondaryUnit = this.changeSecondaryUnit.bind(this);
    this.onChangeAddress = this.onChangeAddress.bind(this);
    this.pasteAddress = this.pasteAddress.bind(this);
    this.submitStep = this.submitStep.bind(this);
    this.goBack = this.goBack.bind(this);
    this.sendPayment = this.sendPayment.bind(this);
    this._validate = this._validate.bind(this);
    this.state = {
      step: 1,
      address: null,
      primaryUnit: 'MBYTE',
      secondaryUnit: 'USD',
      primaryValue: 0,
      secondaryValue: 0,
    };
  }

  componentDidMount() {
    if (_.get(this.props, 'navigation.state.params.walletAddress')) {
      this.props.navigation.setParams({ title: 'Enter amount' });
      this.setState({
        address: this.props.navigation.state.params.walletAddress,
        step: 2,
      });
    } else {
      this.props.navigation.setParams({ title: 'Enter address' });
    }
  }

  changeValue(value, type) {
    if (isNaN(value) || !['primary', 'secondary'].includes(type)) {
      return;
    }

    let primaryValue, secondaryValue;
    const {
      primaryUnit,
      secondaryUnit,
    } = this.state;
    const { exchangeRates } = this.props;

    // Calculate other value by exchange rate
    if (type === 'primary') {
      if (typeof exchangeRates[`${primaryUnit}_${secondaryUnit}`] != 'undefined') {
        secondaryValue = value * exchangeRates[`${primaryUnit}_${secondaryUnit}`];
      }
    } else if (type === 'secondary') {
      if (typeof exchangeRates[`${primaryUnit}_${secondaryUnit}`] != 'undefined') {
        primaryValue = value / exchangeRates[`${primaryUnit}_${secondaryUnit}`];
      }
    }
    // Additional parsing
    if (type === 'primary' && value > 0) {
      if (secondaryUnit === 'USD') {
        secondaryValue = _.round(secondaryValue, 2).toFixed(2);
      } else if (secondaryUnit === 'BTC') {
        secondaryValue = _.round(secondaryValue, 8).toFixed(8);
      }
    } else if (type === 'secondary' && value > 0) {
      if (primaryUnit === 'BYTE') {
        primaryValue = _.round(primaryValue);
      } else if (primaryUnit === 'kBYTE') {
        primaryValue = _.round(primaryValue, 3).toFixed(3);
      } else if (primaryUnit === 'MBYTE') {
        primaryValue = _.round(primaryValue, 6).toFixed(6);
      } else if (primaryUnit === 'GBYTE') {
        primaryValue = _.round(primaryValue, 9).toFixed(9);
      }
    }

    this.setState({
      primaryValue: type === 'primary' ? value : primaryValue,
      secondaryValue: type === 'secondary' ? value : secondaryValue,
    });
  }

  async changePrimaryUnit(primaryUnit) {
    await this.setState({ primaryUnit });
    this.changeValue(this.state.primaryValue, 'primary');
  }

  async changeSecondaryUnit(secondaryUnit) {
    await this.setState({ secondaryUnit });
    this.changeValue(this.state.secondaryValue, 'secondary');
  }

  onChangeAddress(value) {
    let address = String(value.trim());
    if (address.length <= 34) {
      this.setState({ address });
    }
  }

  async pasteAddress() {
    let address = await Clipboard.getString();
    address = address.trim().substring(0, 34);
    this.setState({ address });
  }

  submitStep() {
    if (this._validate()) {
      if (this.state.step === 1) {
        this.setState({ step: 2 });
        this.props.navigation.setParams({ title: 'Enter amount' });
      } else if (this.state.step === 2) {
        this.sendPayment();
      }
    }
  }

  goBack() {
    if (this.state.step === 2) {
      this.props.navigation.setParams({ title: 'Enter address' });
    }
    this.setState({ step: this.state.step - 1 })
  }

  sendPayment() {
    const params = {
      outputs: [
        {
          address: this.state.address,
          amount: unitToBytes(this.state.primaryValue, this.state.primaryUnit),
        }
      ]
    };
    this.props.sendPayment(params);
  }

  _validate() {
    if ([1, 2].includes(this.state.step) && !isValidAddress(this.state.address)) {
      alert('Invalid address');
      return false;
    }

    if ([2].includes(this.state.step)) {
      if (isNaN(this.state.primaryValue)) {
        alert('Invalid amount');
        return false;
      }
    }

    return true;
  }

  render() {
    const {
      step,
      address,
      primaryValue,
      secondaryValue,
      primaryUnit,
      secondaryUnit,
    } = this.state;

    return (
      <KeyboardAvoidingView style={styles.content}>
        {step === 1 &&
          <React.Fragment>
            <View style={styles.addressInputBox}>
              <TextInput
                style={styles.addressInput}
                onChangeText={this.onChangeAddress}
                value={address ? address : ''}
                autoFocus={true}
              />
              {!address &&
                <View style={styles.addressInputPaste}>
                  <TouchableOpacity onPress={this.pasteAddress}>
                    <CopyIcon
                      color={colors.grey.light}
                      style={styles.addressInputPasteIcon}
                      width={19}
                      height={22}
                    />
                  </TouchableOpacity>
                </View>
              }
            </View>
            <Button
              text='Next'
              style={styles.confirmButton}
              onPress={this.submitStep}
            />
          </React.Fragment>
        }
        {step === 2 &&
          <React.Fragment>
            <TouchableOpacity
              style={styles.addressBox}
              onPress={this.goBack}
            >
              <Text style={styles.addressText}>
                {this.props.method === 'request' ? 'From: ' : 'To: '}
                {address}
              </Text>
            </TouchableOpacity>
            <View style={{ ...styles.field, ...styles.primaryField }}>
              <TextInput
                style={styles.input}
                onChangeText={value => this.changeValue(value, 'primary')}
                value={(!primaryValue) ? '' : String(primaryValue)}
                keyboardType='decimal-pad'
                autoFocus={true}
              />
              <RNPickerSelect
                value={primaryUnit}
                onValueChange={value => this.changePrimaryUnit(value)}
                items={availableUnits.map(unit => ({ label: unit.label, value: unit.altValue }))}
              />
            </View>
            <View style={styles.field}>
              <TextInput
                style={styles.input}
                onChangeText={value => this.changeValue(value, 'secondary')}
                value={(!secondaryValue) ? '' : String(secondaryValue)}
                keyboardType='decimal-pad'
              />
              <RNPickerSelect
                value={secondaryUnit}
                onValueChange={value => this.changeSecondaryUnit(value)}
                items={[
                  { label: 'USD', value: 'USD' },
                  { label: 'BTC', value: 'BTC' },
                ]}
              />
            </View>
            <Button
              text={this.props.method === 'request' ? 'Request' : 'Send'}
              style={styles.confirmButton}
              onPress={this.submitStep}
            />
          </React.Fragment>
        }
      </KeyboardAvoidingView>
    );
  }
}

PaymentScreen.defaultProps = {
  method: 'send', // send|request
};

PaymentScreen.propTypes = {
  method: PropTypes.string.isRequired,
};

const mapStateToProps = createStructuredSelector({
  exchangeRates: selectExchangeRates(),
});

mapDispatchToProps = (dispatch) => ({
  sendPayment: (data) => dispatch(sendPaymentStart(data)),
});

PaymentScreen = connect(mapStateToProps, mapDispatchToProps)(PaymentScreen);
export default PaymentScreen;