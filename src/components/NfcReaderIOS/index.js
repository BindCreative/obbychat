import React, { useEffect } from 'react';
import { useDispatch } from "react-redux";

import { Platform, Text, View, AppState } from 'react-native';

import Button from './../../components/Button';

import { runNfcReader, stopNfcReader } from '../../lib/NfcProxy';

import { openLink } from "../../actions/device";

import NfcIcon from '../../assets/images/nfc-icon.svg';

import styles from "./styles";
import { colors } from "../../constants";

const NfcReaderIOS = () => {
  const dispatch = useDispatch();

  const readNfcTag = async () => {
    const link = await runNfcReader();
    if (link) {
      dispatch(openLink({ link }));
    }
    await stopNfcReader();
  };

  // return Platform.OS === 'android'
  //   ? (
  //     <View style={styles.textContainer}>
  //       <NfcIcon
  //         style={styles.nfcIcon}
  //         width={26}
  //         height={26}
  //         fill={colors.grey.dark}
  //       />
  //       <Text style={styles.text}>
  //         Put your device near the other device that has QR code open
  //       </Text>
  //     </View>
  //   )
  //   : (
  //     <Button
  //       text='Scan link via NFC'
  //       style={styles.button}
  //       onPress={readNfcTag}
  //       icon={
  //         <NfcIcon
  //           style={styles.nfcIcon}
  //           width={26}
  //           height={26}
  //           fill={colors.white}
  //         />
  //       }
  //     />
  //   );

  return (
    <Button
      text='Scan link via NFC'
      style={styles.button}
      onPress={readNfcTag}
      icon={
        <NfcIcon
          style={styles.nfcIcon}
          width={26}
          height={26}
          fill={colors.white}
        />
      }
    />
  );
};

export default NfcReaderIOS;
