import React from 'react';
import PropTypes from 'prop-types';
import { TextInput, Clipboard, KeyboardAvoidingView } from 'react-native';
import { View, Text } from 'native-base';
import RNPickerSelect from 'react-native-picker-select';
import CopyIcon from './../../assets/images/icon-copy.svg';
import _ from 'lodash';
import Button from '../Button';
import styles from './styles';
import { colors } from '../../constants';
import { TouchableOpacity } from 'react-native-gesture-handler';


class PaymentScreen extends React.Component {
  constructor(props) {
    super(props);
    this.onChangePrimaryValue = this.onChangePrimaryValue.bind(this);
    this.onChangeSecondaryValue = this.onChangeSecondaryValue.bind(this);
    this.onChangePrimaryUnit = this.onChangePrimaryUnit.bind(this);
    this.onChangeSecondaryUnit = this.onChangeSecondaryUnit.bind(this);
    this.onChangeAddress = this.onChangeAddress.bind(this);
    this.pasteAddress = this.pasteAddress.bind(this);
    this.submitStep = this.submitStep.bind(this);
    this.goBack = this.goBack.bind(this);
    this.state = {
      step: 1,
      address: null,
      primaryUnit: 'MB',
      secondaryUnit: 'USD',
      primaryValue: 0, // bytes
      secondaryValue: 0, // USD
      valueRatio: 2, // X:1
    };
  }

  componentDidMount() {
    if (_.get(this.props, 'navigation.state.params.walletAddress')) {
      this.setState({
        address: this.props.navigation.state.params.walletAddress,
        step: 2,
      });
    }
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

  onChangeAddress(value) {
    let address = String(value.trim()).toUpperCase();
    if (address.length < 34) {
      this.setState({ address });
    }
  }

  async pasteAddress() {
    let address = await Clipboard.getString();
    address = address.trim().substring(0, 34);
    this.setState({ address });
  }

  submitStep() {
    this.setState({ step: this.state.step + 1 })
  }

  goBack() {
    this.setState({ step: this.state.step - 1 })
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
                onChangeText={value => this.onChangePrimaryValue(value)}
                value={(primaryValue === 0) ? '' : String(primaryValue)}
                keyboardType='decimal-pad'
                autoFocus={true}
              />
              <RNPickerSelect
                value={primaryUnit}
                onValueChange={value => this.onChangePrimaryUnit(value)}
                items={[
                  { label: 'bytes', value: 'B' },
                  { label: 'KB', value: 'kB' },
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

export default PaymentScreen;