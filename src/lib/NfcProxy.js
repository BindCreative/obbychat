import NfcManager, { NfcTech, Ndef, NfcAdapter } from 'react-native-nfc-manager';
import HCESession, { NFCContentType, NFCTagType4 } from 'react-native-hce';

let simulation;

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
  try {
    await NfcManager.cancelTechnologyRequest();
  } catch (e) {
    console.log(e);
  }
};

export const runNfcReader = async () => {
  let uri = '';
  const supported = await NfcManager.isSupported();
  if (supported) {
    await NfcManager.start();
    const isEnabled = await NfcManager.isEnabled();
    if (isEnabled) {
      try {
        await NfcManager.requestTechnology(NfcTech.Ndef, { alertMessage: "Put your device near the other device that has QR code open" });
        const tag = await NfcManager.getTag();
        tag.ndefStatus = await NfcManager.ndefHandler.getNdefStatus();
        uri = decodeTag(tag);
      } catch (ex) {
        console.log(ex);
      } finally {
        await stopNfcReader();
      }
    }
  }
  return uri;
};

export const runHceSimulation = async (url) => {
  const tag = new NFCTagType4(NFCContentType.URL, url);
  simulation = await (new HCESession(tag)).start();
};

export const stopHceSimulation = async () => {
  await simulation.terminate();
};
