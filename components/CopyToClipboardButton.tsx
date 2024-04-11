import Clipboard from '@react-native-clipboard/clipboard';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import loc from '../loc';

type CopyToClipboardButtonProps = {
  stringToCopy: string;
  displayText?: string;
};

export const CopyToClipboardButton: React.FC<CopyToClipboardButtonProps> = ({ stringToCopy, displayText }) => {
  const onPress = () => {
    Clipboard.setString(stringToCopy);
  };

  return (
    <TouchableOpacity accessibilityRole="button" onPress={onPress}>
      <Text style={styles.text}>{displayText && displayText.length > 0 ? displayText : loc.transactions.details_copy}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  text: { fontSize: 13, fontWeight: '400', color: '#68bbe1' },
});

export default CopyToClipboardButton;
