import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { BlueSpacing20, BlueTextCentered } from '../../BlueComponents';
import navigationStyle from '../../components/navigationStyle';
import loc from '../../loc';
import QRCodeComponent from '../../components/QRCodeComponent';
import { useTheme } from '../../components/themes';
import SafeArea from '../../components/SafeArea';
import CopyTextToClipboard from '../../components/CopyTextToClipboard';

const LNDViewAdditionalInvoicePreImage = () => {
  // state = { walletInfo: undefined };
  const { colors } = useTheme();
  const { preImageData } = useRoute().params;
  const stylesHook = StyleSheet.create({
    root: {
      backgroundColor: colors.elevated,
    },
  });

  return (
    <SafeArea style={stylesHook.root}>
      <View style={styles.wrapper}>
        <BlueTextCentered>{loc.lndViewInvoice.preimage}:</BlueTextCentered>
        <BlueSpacing20 />
        <View style={styles.qrCodeContainer}>
          <QRCodeComponent value={preImageData} size={300} logoSize={90} />
        </View>
        <BlueSpacing20 />
        <CopyTextToClipboard text={preImageData} />
      </View>
    </SafeArea>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrCodeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
});

export default LNDViewAdditionalInvoicePreImage;

LNDViewAdditionalInvoicePreImage.navigationOptions = navigationStyle({}, opts => ({ ...opts, title: loc.lndViewInvoice.additional_info }));
