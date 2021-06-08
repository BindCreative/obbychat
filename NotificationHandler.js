import { Platform } from 'react-native'
import PushNotification from 'react-native-push-notification';

class NotificationHandler {
  token = "";
  onNotification(notification) {
    console.log('onNotification:', notification);
    if (typeof this._onNotification === 'function') {
      this._onNotification(notification);
    }
  }

  onRegister(token) {
    console.log('onRegister:', token);
    this.token = token;
    if (typeof this._onRegister === 'function') {
      this._onRegister(token);
    }
  }

  onAction(notification) {
    console.log ('onAction:', notification);
    if(notification.action === 'Yes') {
      PushNotification.invokeApp(notification);
    }
  }

  onRegistrationError(err) {
    console.log(err);
  }

  attachRegister(handler) {
    this._onRegister = handler;
  }

  attachNotification(handler) {
    this._onNotification = handler;
  }
}

const handler = new NotificationHandler();

PushNotification.configure({
  onRegister: handler.onRegister.bind(handler),
  onNotification: handler.onNotification.bind(handler),
  onAction: handler.onAction.bind(handler),
  onRegistrationError: handler.onRegistrationError.bind(handler),
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },
  popInitialNotification: true,
  requestPermissions: Platform.OS === 'ios'
});

export default handler;
