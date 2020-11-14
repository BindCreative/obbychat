import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import {
  TextInput,
  Clipboard,
  KeyboardAvoidingView,
  View,
  Text,
} from 'react-native';
import CopyIcon from './../../assets/images/icon-copy.svg';
import SafeAreaView from 'react-native-safe-area-view';
import _ from 'lodash';
import { isValidAddress } from 'obyte/lib/utils';

import Header from '../../components/Header';
import Button from '../../components/Button';
import ActionSheet from '../../components/ActionSheet';
import styles from './styles';
import { colors } from '../../constants';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { selectExchangeRates } from './../../selectors/exchangeRates';
import { selectWalletAddress } from './../../selectors/wallet';
import { sendPaymentStart } from './../../actions/wallet';
import { PRIMARY_UNITS, SECONDARY_UNITS, unitToBytes } from './../../lib/utils';
import { urlHost } from './../../lib/oCustom';

export const Methods = {
  SEND: 'SEND',
  REQUEST: 'REQUEST',
};

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
    this.requestPayment = this.requestPayment.bind(this);
    this._validate = this._validate.bind(this);
    this.state = {
      step: 1,
      address: null,
      primaryUnit: 'MBYTE',
      secondaryUnit: 'USD',
      primaryValue: 0,
      secondaryValue: 0,
      disabledInputs: false
    };
  }

  componentDidMount() {
    if (_.get(this.props, 'navigation.state.params.walletAddress', false)) {
      this.props.navigation.setParams({ title: 'Enter amount' });
      const amount = this.props.navigation.state.params.amount;
      this.setState({
        address: this.props.navigation.state.params.walletAddress,
        step: 2
      });
      if (amount) {
        this.changePrimaryUnit('BYTE')
          .then(() => this.changeValue(amount, 'primary'));
      } else {
        this.changePrimaryUnit('MBYTE')
          .then(() => this.changeValue(0, 'primary'));
      }
    } else {
      this.props.navigation.setParams({ title: 'Enter address' });
    }
  }

  componentDidUpdate(prevProps): void {
    const { navigation } = this.props;
    if (navigation.state.params.walletAddress
      && navigation.state.params !== prevProps.navigation.state.params) {
      const { walletAddress, amount } = navigation.state.params;
      this.setState({
        address: walletAddress,
        step: 2
      });
      if (amount) {
        this.changePrimaryUnit('BYTE')
          .then(() => this.changeValue(amount, 'primary'));
      } else {
        this.changePrimaryUnit('MBYTE')
          .then(() => this.changeValue(0, 'primary'));
      }
    }
  }

  changeValue(value, type) {
    if (isNaN(value) || !['primary', 'secondary'].includes(type)) {
      return;
    }

    let primaryValue, secondaryValue;
    const { primaryUnit, secondaryUnit } = this.state;
    const { exchangeRates } = this.props;

    // Calculate other value by exchange rate
    if (type === 'primary') {
      if (
        typeof exchangeRates[`${primaryUnit}_${secondaryUnit}`] !== 'undefined'
      ) {
        secondaryValue =
          value * exchangeRates[`${primaryUnit}_${secondaryUnit}`];
      }
    } else if (type === 'secondary') {
      if (
        typeof exchangeRates[`${primaryUnit}_${secondaryUnit}`] !== 'undefined'
      ) {
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
      primaryValue:
        type === 'primary' ? value : !isNaN(primaryValue) ? primaryValue : 0,
      secondaryValue:
        type === 'secondary'
          ? value
          : !isNaN(secondaryValue)
          ? secondaryValue
          : 0,
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
    const { method } = this.props;
    if (this._validate()) {
      if (this.state.step === 1) {
        this.setState({ step: 2 });
        this.props.navigation.setParams({ title: 'Enter amount' });
      } else if (this.state.step === 2 && method === Methods.SEND) {
        this.sendPayment();
        this.props.navigation.navigate('WalletStack');
      } else if (this.state.step === 2 && method === Methods.REQUEST) {
        this.requestPayment();
        this.props.navigation.pop();
      }
    }
  }

  goBack() {
    if (this.state.step === 2) {
      this.props.navigation.setParams({ title: 'Enter address' });
    }
    this.setState({ step: this.state.step - 1 });
  }

  sendPayment() {
    const params = {
      outputs: [
        {
          address: this.state.address,
          amount: unitToBytes(this.state.primaryValue, this.state.primaryUnit),
        },
      ],
    };
    this.props.sendPayment(params);
  }

  requestPayment() {
    const callback = _.get(
      this.props,
      'navigation.state.params.callback',
      false,
    );
    const requestString = `[${this.state.primaryValue} ${
      this.state.primaryUnit
    }](${urlHost}${this.props.myWalletAddress}?amount=${unitToBytes(
      this.state.primaryValue,
      this.state.primaryUnit,
    )})`;
    callback(requestString);
  }

  _validate() {
    const callback = _.get(this.props, 'navigation.state.params.callback');
    const { method } = this.props;
    if (
      [1, 2].includes(this.state.step) &&
      !isValidAddress(this.state.address)
    ) {
      alert('Invalid address');
      return false;
    }

    if (this.state.step === 2) {
      if (isNaN(this.state.primaryValue)) {
        alert('Invalid amount');
        return false;
      }

      if (!Object.keys(Methods).includes(method)) {
        alert('Something went wrong!');
        return false;
      }

      if (method === Methods.REQUEST && !callback) {
        alert('Something went wrong!');
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
      <SafeAreaView
        style={styles.container}
        forceInset={{ top: 'always', bottom: 'always' }}
      >
        <KeyboardAvoidingView style={styles.content}>
          <Header
            {...this.props}
            title={
              this.props.method === Methods.REQUEST
                ? 'Request payment'
                : 'Make payment'
            }
            size='compact'
            titlePosition='center'
            hasBackButton
          />
          {step === 1 && (
            <React.Fragment>
              <View style={styles.addressInputBox}>
                <TextInput
                  style={styles.addressInput}
                  onChangeText={this.onChangeAddress}
                  value={address ? address : ''}
                  autoFocus={true}
                />
                {!address && (
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
                )}
              </View>
              <Button
                disabled={!address}
                text='Next'
                style={styles.confirmButton}
                onPress={this.submitStep}
              />
            </React.Fragment>
          )}
          {step === 2 && (
            <React.Fragment>
              <TouchableOpacity style={styles.addressBox} onPress={this.goBack}>
                <Text style={styles.addressText}>To: {address}</Text>
              </TouchableOpacity>
              <View style={{ ...styles.field, ...styles.primaryField }}>
                <TextInput
                  style={styles.input}
                  onChangeText={value => this.changeValue(value, 'primary')}
                  value={!primaryValue ? '' : String(primaryValue)}
                  keyboardType='decimal-pad'
                />
                <ActionSheet
                  currentValue={primaryUnit}
                  onChange={value => this.changePrimaryUnit(value)}
                  items={PRIMARY_UNITS.map(({ label, altValue }) => ({
                    label,
                    value: altValue,
                  }))}
                />
              </View>
              <View style={styles.field}>
                <TextInput
                  style={styles.input}
                  onChangeText={value => this.changeValue(value, 'secondary')}
                  value={!secondaryValue ? '' : String(secondaryValue)}
                  keyboardType='decimal-pad'
                />
                <ActionSheet
                  currentValue={secondaryUnit}
                  onChange={value => this.changeSecondaryUnit(value)}
                  items={SECONDARY_UNITS.map(({ label, altValue }) => ({
                    label,
                    value: altValue,
                  }))}
                />
              </View>
              <Button
                text={
                  this.props.method === Methods.REQUEST ? 'Request' : 'Send'
                }
                style={styles.confirmButton}
                onPress={this.submitStep}
              />
            </React.Fragment>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
}

PaymentScreen.defaultProps = {
  method: Methods.SEND,
};

PaymentScreen.propTypes = {
  method: PropTypes.string.isRequired,
};

const mapStateToProps = createStructuredSelector({
  exchangeRates: selectExchangeRates(),
  myWalletAddress: selectWalletAddress(),
});

const mapDispatchToProps = dispatch => ({
  sendPayment: data => dispatch(sendPaymentStart(data)),
});

PaymentScreen = connect(mapStateToProps, mapDispatchToProps)(PaymentScreen);
export default PaymentScreen;
