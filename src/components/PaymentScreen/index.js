import React from 'react';
import { Container, Text } from 'native-base';


class PaymentScreen extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Container>
        <Text>Send payment</Text>
      </Container>
    );
  }
}

export default PaymentScreen;