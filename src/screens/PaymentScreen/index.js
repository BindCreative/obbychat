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
import { selectExchangeRates } from "../../selectors/main";
import { selectWalletAddress } from "../../selectors/temporary";
import { sendPaymentStart } from './../../actions/wallet';
import { PRIMARY_UNITS, SECONDARY_UNITS, unitToBytes, bytesToUnit } from './../../lib/utils';
import { urlHost } from './../../lib/oCustom';

export const Methods = {
  SEND: 'SEND',
  REQUEST: 'REQUEST',
};

const splitDecimals = (value, maxDecimals, showZeros = false) => {
  if (!value) {
    return '';
  }
  const splittedValue = `${value}`.split('.');
  const integer = splittedValue[0];
  let fraction = splittedValue[1] ? splittedValue[1].slice(0, maxDecimals) : '';
  // if (!Number(integer) && (fraction && !Number(fraction)) && !showZeros) {
  //   return '';
  // } else
  if (!fraction && (value && value.includes('.')) && maxDecimals) {
    return value;
  } else {
    return fraction ? `${integer}.${fraction}` : integer;
  }
};

const convertPrimaryDecimals = (value, unit, showZeros) => {
  if (unit === 'BYTE') {
    return splitDecimals(value, 0, showZeros);
  } else if (unit === 'kBYTE') {
    return splitDecimals(value, 3, showZeros);
  } else if (unit === 'MBYTE') {
    return splitDecimals(value, 6, showZeros);
  } else if (unit === 'GBYTE') {
    return splitDecimals(value, 9, showZeros);
  }
};

const convertSecondaryDecimals = (value, unit, showZeros) => {
  if (unit === 'USD') {
    return splitDecimals(value, 2, showZeros);
  } else if (unit === 'BTC') {
    return splitDecimals(value, 8, showZeros);
  }
};

class PaymentScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      address: null,
      primaryUnit: 'MBYTE',
      secondaryUnit: 'USD',
      primaryValue: '',
      secondaryValue: '',
      disabledInputs: false,
      correspondent: null
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
          .then(() => this.changeValue(`${amount}`, 'primary'));
      } else {
        this.changePrimaryUnit('MBYTE')
          .then(() => this.changeValue('', 'primary'));
      }
    } else {
      this.props.navigation.setParams({ title: 'Enter address' });
    }
  }

  componentDidUpdate(prevProps): void {
    const { navigation } = this.props;
    if (navigation.state.params.walletAddress
      && navigation.state.params !== prevProps.navigation.state.params) {
      const { walletAddress, amount, correspondent } = navigation.state.params;
      this.setState({
        address: walletAddress,
        step: 2,
        correspondent
      });
      if (amount) {
        this.changePrimaryUnit('BYTE')
          .then(() => this.changeValue(`${amount}`, 'primary'));
      } else {
        this.changePrimaryUnit('MBYTE')
          .then(() => this.changeValue('', 'primary'));
      }
    }
  }

  changeValue = (value, type) => {
    if (isNaN(value) || !['primary', 'secondary'].includes(type)) {
      return;
    }
    let parsedValue = value;
    if (Number(value) && Number.isInteger(Number(value))) {
      parsedValue = value.replace(/^0+/, '');
    }
    let primaryValue, secondaryValue;
    const { primaryUnit, secondaryUnit } = this.state;
    const { exchangeRates } = this.props;
    if (type === 'primary') {
      primaryValue = convertPrimaryDecimals(parsedValue, primaryUnit);
      secondaryValue = convertSecondaryDecimals((parsedValue * exchangeRates[`${primaryUnit}_${secondaryUnit}`]).toFixed(8), secondaryUnit, !!primaryValue);
    } else if (type === 'secondary') {
      secondaryValue = convertSecondaryDecimals(parsedValue, secondaryUnit);
      primaryValue = convertPrimaryDecimals((parsedValue / exchangeRates[`${primaryUnit}_${secondaryUnit}`]).toFixed(9), primaryUnit, !!secondaryValue);
    }
    this.setState({
      primaryValue: primaryValue,
      secondaryValue: secondaryValue
    });
  };

  convertPrimaryValue = (nextUnit) => {
    const { primaryUnit, primaryValue } = this.state;
    const bytes = unitToBytes(primaryValue, primaryUnit);
    return `${primaryValue}` ? bytesToUnit(bytes, nextUnit) : primaryValue;
  };

  changePrimaryUnit = async(primaryUnit) => {
    const convertedPrimaryValue = this.convertPrimaryValue(primaryUnit);
    await this.setState({ primaryUnit });
    this.changeValue(`${convertedPrimaryValue}`, 'primary');
  };

  changeSecondaryUnit = async(secondaryUnit) => {
    await this.setState({ secondaryUnit });
    this.changeValue(this.state.secondaryValue, 'secondary');
  };

  onChangeAddress = (value) => {
    let address = String(value.trim());
    if (address.length <= 34) {
      this.setState({ address });
    }
  };

  pasteAddress = async() => {
    let address = await Clipboard.getString();
    address = address.trim().substring(0, 34);
    this.setState({ address });
  };

  submitStep = () => {
    const { method } = this.props;
    if (this._validate()) {
      if (this.state.step === 1) {
        this.setState({ step: 2 });
        this.props.navigation.setParams({ title: 'Enter amount' });
      } else if (this.state.step === 2 && method === Methods.SEND) {
        this.sendPayment();
        if (!this.state.correspondent) {
          this.props.navigation.navigate('WalletStack');
        }
      } else if (this.state.step === 2 && method === Methods.REQUEST) {
        this.requestPayment();
        this.props.navigation.pop();
      }
    }
  };

  goBack = () => {
    if (this.state.step === 2) {
      this.props.navigation.setParams({ title: 'Enter address' });
    }
    this.setState({ step: this.state.step - 1 });
  };

  sendPayment = () => {
    const {
      address, correspondent, primaryValue, primaryUnit
    } = this.state;
    const data = {
      params: {
        outputs: [
          {
            address,
            amount: unitToBytes(primaryValue, primaryUnit)
          },
        ],
      },
      correspondent
    };
    this.props.sendPayment(data);
  };

  requestPayment = () => {
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
  };

  _validate = () => {
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
      if (!this.state.primaryValue || isNaN(this.state.primaryValue)) {
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
  };

  render() {
    const {
      step, address, primaryValue,
      secondaryValue, primaryUnit, secondaryUnit
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
                  autofocus={false}
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
                  value={String(primaryValue)}
                  keyboardType='decimal-pad'
                  autofocus={false}
                  selectTextOnFocus={true}
                />
                <ActionSheet
                  currentValue={primaryUnit}
                  onChange={this.changePrimaryUnit}
                  items={PRIMARY_UNITS.map(({ label, altValue }) => ({ label, value: altValue }))}
                />
              </View>
              <View style={styles.field}>
                <TextInput
                  style={styles.input}
                  onChangeText={value => this.changeValue(value, 'secondary')}
                  value={String(secondaryValue)}
                  keyboardType='decimal-pad'
                  autofocus={false}
                  selectTextOnFocus={true}
                />
                <ActionSheet
                  currentValue={secondaryUnit}
                  onChange={value => this.changeSecondaryUnit(value)}
                  items={SECONDARY_UNITS.map(({ label, value }) => ({ label, value }))}
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
