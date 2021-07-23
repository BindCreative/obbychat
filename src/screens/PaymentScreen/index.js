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
import NfcReader from '../../components/NfcReader';
import ActionSheet from '../../components/ActionSheet';
import styles from './styles';
import { colors } from '../../constants';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { selectExchangeRates, selectUnitSize } from "../../selectors/main";
import { selectWalletAddress } from "../../selectors/temporary";
import { sendPaymentStart, checkIsAutonomousAgent } from './../../actions/wallet';
import {
  PRIMARY_UNITS, SECONDARY_UNITS,
  unitToBytes, bytesToUnit, getMaxDecimalsLength, getUnitAltValue, getUnitLabel
} from './../../lib/utils';
import { urlHost } from './../../lib/oCustom';
import { REGEXP_QR_REQUEST_PAYMENT } from "../../lib/messaging";

export const Methods = {
  SEND: 'SEND',
  REQUEST: 'REQUEST',
};

const zeroValueToEmptyString = value => value.replace(/^[0]*\.?[0]*$/, "");

const getMaxLength = (value, unit) => {
  let maxLength = 0;
  if (value.includes('.')) {
    const valueInt = value.split(".")[0];
    maxLength += (valueInt.length + 1);
    maxLength += getMaxDecimalsLength(unit);
  } else {
    maxLength = 20;
  }
  return maxLength;
};

class PaymentScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      address: null,
      primaryUnit: getUnitAltValue(props.unit),
      secondaryUnit: 'USD',
      primaryValue: '',
      secondaryValue: '',
      disabledInputs: false,
      correspondent: null
    };
  }

  runToSecondStep = async () => {
    const { navigation, unit } = this.props;
    const { walletAddress, amount, correspondent } = navigation.state.params;
    this.setState({ address: walletAddress, step: 2, correspondent });
    if (amount) {
      await this.changePrimaryUnit('BYTE');
      await this.changeValue(`${amount}`, 'primary');
      await this.changePrimaryUnit(getUnitAltValue(unit))
    } else {
      await this.changePrimaryUnit(getUnitAltValue(unit));
      await this.changeValue('', 'primary');
    }
  };

  componentDidMount() {
    if (_.get(this.props, 'navigation.state.params.walletAddress', false)) {
      this.runToSecondStep();
    }
  }

  componentDidUpdate(prevProps): void {
    const { navigation } = this.props;
    if (_.get(navigation, 'state.params.walletAddress', false)
      && navigation.state.params !== prevProps.navigation.state.params) {
      this.runToSecondStep();
    }
  }

  changePrimaryValue = value => this.changeValue(value, 'primary');

  changeSecondaryValue = value => this.changeValue(value, 'secondary');

  changeValue = async (value, type) => {
    const commaValue = value.replace(",", ".");
    if (isNaN(commaValue) || !['primary', 'secondary'].includes(type)) {
      return;
    }
    let parsedValue = commaValue;
    if (Number(commaValue) && Number.isInteger(Number(commaValue))) {
      parsedValue = commaValue.replace(/^0+/, '');
    }
    let primaryValue, secondaryValue;
    const { primaryUnit, secondaryUnit } = this.state;
    const { exchangeRates } = this.props;
    if (type === 'primary') {
      primaryValue = parsedValue;
      secondaryValue = (parsedValue * exchangeRates[`${primaryUnit}_${secondaryUnit}`]).toFixed(getMaxDecimalsLength(secondaryUnit));
      if (!primaryValue) {
        secondaryValue = zeroValueToEmptyString(secondaryValue);
      }
    } else if (type === 'secondary') {
      secondaryValue = parsedValue;
      primaryValue = (parsedValue / exchangeRates[`${primaryUnit}_${secondaryUnit}`]).toFixed(getMaxDecimalsLength(primaryUnit));
      if (!secondaryValue) {
        primaryValue = zeroValueToEmptyString(primaryValue);
      }
    }
    await this.setState({
      primaryValue: primaryValue,
      secondaryValue: secondaryValue
    });
  };

  convertPrimaryValue = (nextUnit) => {
    const { primaryUnit, primaryValue } = this.state;
    const bytes = unitToBytes(primaryValue, primaryUnit);
    return `${primaryValue}`
      ? bytesToUnit(bytes, nextUnit)
        .toFixed(getMaxDecimalsLength(nextUnit) || 1)
        .replace(/\.?0+$/, '')
      : primaryValue;
  };

  changePrimaryUnit = async (primaryUnit) => {
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
    if (address.length <= 32) {
      this.setState({ address });
    }
  };

  pasteAddress = async() => {
    let address = await Clipboard.getString();
    address = address.trim();
    address.replace(REGEXP_QR_REQUEST_PAYMENT, (str, payload, walletAddress) => {
      address = walletAddress;
    });
    this.setState({ address });
  };

  submitStep = () => {
    const { method, checkIsAA, navigation } = this.props;
    const { step, address, correspondent } = this.state;
    if (this._validate()) {
      if (step === 1) {
        this.setState({ step: 2 });
        checkIsAA({ address })
      } else if (step === 2 && method === Methods.SEND) {
        this.sendPayment();
        if (!correspondent) {
          navigation.navigate('WalletStack');
        }
      } else if (step === 2 && method === Methods.REQUEST) {
        this.requestPayment();
        navigation.pop();
      }
    }
  };

  goBack = () => {
    this.setState({ step: this.state.step - 1 });
  };

  sendPayment = () => {
    const {
      address, primaryValue, primaryUnit
    } = this.state;
    const { params = {} } = this.props.navigation.state;
    const { asset, correspondent, data } = params;
    const requestData = {
      params: {
        outputs: [
          {
            address,
            amount: unitToBytes(primaryValue, primaryUnit)
          },
        ],
      },
      correspondent,
      data
    };
    // if (asset) {
    //   data.params.asset = asset;
    // }
    this.props.sendPayment(requestData);
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

  getMaxPrimaryLength = () => {
    const { primaryValue, primaryUnit } = this.state;
    return getMaxLength(primaryValue, primaryUnit);
  };

  getMaxSecondaryLength = () => {
    const { secondaryValue, secondaryUnit } = this.state;
    return getMaxLength(secondaryValue, secondaryUnit);
  };

  render() {
    const {
      step, address, primaryValue,
      secondaryValue, primaryUnit, secondaryUnit
    } = this.state;
    const data = _.get(this.props, 'navigation.state.params.data', null);

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
                  onChangeText={this.changePrimaryValue}
                  value={primaryValue}
                  keyboardType='decimal-pad'
                  autofocus={false}
                  selectTextOnFocus={true}
                  maxLength={this.getMaxPrimaryLength()}
                />
                <ActionSheet
                  currentValue={getUnitLabel(primaryUnit)}
                  onChange={this.changePrimaryUnit}
                  items={PRIMARY_UNITS.map(({ label, altValue }) => ({ label, value: altValue }))}
                />
              </View>
              <View style={styles.field}>
                <TextInput
                  style={styles.input}
                  onChangeText={this.changeSecondaryValue}
                  value={secondaryValue}
                  keyboardType='decimal-pad'
                  autofocus={false}
                  selectTextOnFocus={true}
                  maxLength={this.getMaxSecondaryLength()}
                />
                <ActionSheet
                  currentValue={secondaryUnit}
                  onChange={value => this.changeSecondaryUnit(value)}
                  items={SECONDARY_UNITS.map(({ label, value }) => ({ label, value }))}
                />
              </View>
              {data && (
                <View style={styles.jsonContainer}>
                  <Text>
                    {JSON.stringify(data)}
                  </Text>
                </View>
              )}
            </React.Fragment>
          )}
          {this.props.method === Methods.SEND && (
            <View style={styles.nfcReaderContainer}>
              <NfcReader />
            </View>
          )}
          <Button
            disabled={step === 1 && !address}
            text={
              step === 1
                ? 'Next'
                : this.props.method === Methods.REQUEST
                  ? 'Request'
                  : 'Send'
            }
            style={styles.confirmButton}
            onPress={this.submitStep}
          />
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
  unit: PropTypes.string.isRequired
};

const mapStateToProps = createStructuredSelector({
  exchangeRates: selectExchangeRates(),
  myWalletAddress: selectWalletAddress(),
  unit: selectUnitSize()
});

const mapDispatchToProps = dispatch => ({
  sendPayment: data => dispatch(sendPaymentStart(data)),
  checkIsAA: payload => dispatch(checkIsAutonomousAgent(payload))
});

PaymentScreen = connect(mapStateToProps, mapDispatchToProps)(PaymentScreen);
export default PaymentScreen;
