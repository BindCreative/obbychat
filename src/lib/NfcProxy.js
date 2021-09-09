import { Alert } from 'react-native';
import NfcManager, { Ndef, NfcEvents } from 'react-native-nfc-manager';
import HCESession, { NFCContentType, NFCTagType4 } from 'react-native-hce';

let simulation = null;

const decodeTag = (tag) => {
  const ndef =
    Array.isArray(tag.ndefMessage) && tag.ndefMessage.length > 0
      ? tag.ndefMessage[0]
      : null;
  if (ndef) {
    return Ndef.uri.decodePayload(ndef.payload);
  }
  return '';
};

export const runNfcReader = () => new Promise(async (resolve) => {
  let uri = '';
  const supported = await NfcManager.isSupported();
  if (supported) {
    await NfcManager.start();
    const isEnabled = await NfcManager.isEnabled();
    if (isEnabled) {
      try {
        NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag) => {
          uri = decodeTag(tag);
          console.log(uri);
          resolve(uri);
        });
        await NfcManager.registerTagEvent({
          alertMessage: "Put your device near NFC tag or other device that has the QR-code open"
        });
      } catch (ex) {
        console.log(ex);
      }
    }
  }
});

export const stopNfcReader = async () => {
  const cleanUp = () => {
    NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
    NfcManager.setEventListener(NfcEvents.SessionClosed, null);
  };
  NfcManager.setEventListener(NfcEvents.SessionClosed, cleanUp);
  NfcManager.unregisterTagEvent().catch(() => 0);
};

export const runHceSimulation = async (url) => {
  const tag = new NFCTagType4(NFCContentType.URL, url);
  simulation = await (new HCESession(tag)).start();
};

export const stopHceSimulation = async () => {
  if (simulation) {
    await simulation.terminate();
    simulation = null;
  }
};
