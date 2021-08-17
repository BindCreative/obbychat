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

export const stopNfcReader = async () => {
  const cleanUp = () => {
    NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
    NfcManager.setEventListener(NfcEvents.SessionClosed, null);
  };
  await NfcManager.unregisterTagEvent();
  NfcManager.setEventListener(NfcEvents.SessionClosed, () => {
    cleanUp();
  });
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
        await NfcManager.registerTagEvent({ alertMessage: "Put your device near the other device that has QR code open" });
      } catch (ex) {
        console.log(ex);
      }
    }
  }
});

export const runHceSimulation = async (url) => {
  const tag = new NFCTagType4(NFCContentType.URL, url);
  simulation = await new HCESession(tag).start();
};

export const stopHceSimulation = async () => {
  if (simulation) {
    await simulation.terminate();
    simulation = null;
  }
};

export const nfcHceRunner = async (url) => {
  await stopNfcReader();
  await runHceSimulation(url);
};

export const nfcHceStopper = async () => {
  await stopHceSimulation();
  await runNfcReader();
};

export const stopNfc = async () => {
  await stopNfcReader();
  await stopHceSimulation();
};
