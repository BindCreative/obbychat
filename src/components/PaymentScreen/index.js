import React from 'react';
import { Container, Text } from 'native-base';


class PaymentScreen extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const contact = this.props.navigation.state.params.contact;

    return (
      <Container>
        <Text>Send payment</Text>
      </Container>
    );
  }
}

export default PaymentScreen;