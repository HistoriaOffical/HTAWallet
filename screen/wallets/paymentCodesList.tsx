import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useContext, useEffect, useState } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { PaymentCodeStackParamList } from '../../Navigation';
import { BlueStorageContext } from '../../blue_modules/storage-context';
import loc from '../../loc';
import CopyTextToClipboard from '../../components/CopyTextToClipboard';

interface DataSection {
  title: string;
  data: string[];
}

type Props = NativeStackScreenProps<PaymentCodeStackParamList, 'PaymentCodesList'>;

export default function PaymentCodesList({ route }: Props) {
  const { walletID } = route.params;
  const { wallets } = useContext(BlueStorageContext);
  const [data, setData] = useState<DataSection[]>([]);

  useEffect(() => {
    if (!walletID) return;

    const foundWallet = wallets.find(w => w.getID() === walletID);
    if (!foundWallet) return;

    const newData: DataSection[] = [
      {
        title: loc.bip47.who_can_pay_me,
        // @ts-ignore remove later
        data: foundWallet.getBIP47SenderPaymentCodes(),
      },
    ];
    setData(newData);
  }, [walletID, wallets]);

  return (
    <View style={styles.container}>
      {!walletID ? (
        <Text>Internal error</Text>
      ) : (
        <View>
          <SectionList
            sections={data}
            keyExtractor={(item, index) => item + index}
            renderItem={({ item }) => (
              <View>
                <CopyTextToClipboard truncated text={item} />
              </View>
            )}
            renderSectionHeader={({ section: { title } }) => <Text style={styles.titleText}>{title}</Text>}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: { fontSize: 20 },
});
