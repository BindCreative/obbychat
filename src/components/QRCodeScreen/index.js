import React from 'react';
import PropTypes from 'prop-types';
import QRCode from 'react-native-qrcode';
import { AppLoading } from 'expo';
import * as Font from 'expo-font';
import { Container, Button, Text } from 'native-base';
import { colors } from './../../constants';
import styles from './styles';


class QRCodeScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = { loading: true };
  }

  async componentWillMount() {
    await Font.loadAsync({
      Roboto: require("../../../node_modules/native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("../../../node_modules/native-base/Fonts/Roboto_medium.ttf")
    });
    this.setState({ loading: false });
  }

  render() {
    if (this.state.loading) {
      return (
        <AppLoading />
      );
    }
    return (
      <Container style={styles.container}>
        <QRCode
          value={this.props.qrData}
          size={200}
          bgColor={colors.black}
          fgColor={colors.white}
        />
        <Button
          rounded
          style={styles.button}
          onPress={() => this.props.navigation.pop()}
        >
          <Text style={{ fontWeight: '500', fontSize: 20 }}>Done</Text>
        </Button>
      </Container>
    );
  }
}

QRCodeScreen.propTypes = {
  qrData: PropTypes.any.isRequired,
};

export default QRCodeScreen;