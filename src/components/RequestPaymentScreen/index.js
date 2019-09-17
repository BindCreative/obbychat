import React from 'react';
import { Container, View, Text } from 'native-base';
import RelativeUnitField from './../RelativeUnitField';


class RequestPaymentScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      recipientWallet: null,
    };
  }

  componentDidMount() {
    this.setState({
      recipientWallet: this.props.navigation.state.params.recipientWallet || null,
    });
  }

  render() {
    return (
      <Container>
        <View>
          <Text>To: {this.state.recipientWallet}</Text>
        </View>
        <View>
          {/** TODO - <RelativeUnitField/>  */}
        </View>
        <View>

        </View>
      </Container>
    );
  }
}

export default RequestPaymentScreen;