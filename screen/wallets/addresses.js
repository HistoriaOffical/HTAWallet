import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { BlueStorageContext } from '../../blue_modules/storage-context';
import { WatchOnlyWallet } from '../../class';
import { AddressItem } from '../../components/addresses/AddressItem';
import { AddressTypeTabs, TABS } from '../../components/addresses/AddressTypeTabs';
import navigationStyle from '../../components/navigationStyle';
import { useTheme } from '../../components/themes';
import usePrivacy from '../../hooks/usePrivacy';
import loc from '../../loc';

export const totalBalance = ({ c, u } = { c: 0, u: 0 }) => c + u;

export const getAddress = (wallet, index, isInternal) => {
  let address;
  let balance = 0;
  let transactions = 0;

  if (isInternal) {
    address = wallet._getInternalAddressByIndex(index);
    balance = totalBalance(wallet._balances_by_internal_index[index]);
    transactions = wallet._txs_by_internal_index[index]?.length;
  } else {
    address = wallet._getExternalAddressByIndex(index);
    balance = totalBalance(wallet._balances_by_external_index[index]);
    transactions = wallet._txs_by_external_index[index]?.length;
  }

  return {
    key: address,
    index,
    address,
    isInternal,
    balance,
    transactions,
  };
};

export const sortByAddressIndex = (a, b) => {
  if (a.index > b.index) {
    return 1;
  }
  return -1;
};

export const filterByAddressType = (type, isInternal, currentType) => {
  if (currentType === type) {
    return isInternal === true;
  }
  return isInternal === false;
};

const WalletAddresses = () => {
  const [showAddresses, setShowAddresses] = useState(false);

  const [addresses, setAddresses] = useState([]);

  const [currentTab, setCurrentTab] = useState(TABS.EXTERNAL);

  const { wallets } = useContext(BlueStorageContext);

  const { walletID } = useRoute().params;

  const addressList = useRef();

  const wallet = wallets.find(w => w.getID() === walletID);

  const balanceUnit = wallet.getPreferredBalanceUnit();

  const isWatchOnly = wallet.type === WatchOnlyWallet.type;

  const walletInstance = isWatchOnly ? wallet._hdWalletInstance : wallet;

  const allowSignVerifyMessage = 'allowSignVerifyMessage' in wallet && wallet.allowSignVerifyMessage();

  const { colors } = useTheme();

  const { setOptions } = useNavigation();

  const [search, setSearch] = React.useState('');

  const { enableBlur, disableBlur } = usePrivacy();

  const stylesHook = StyleSheet.create({
    root: {
      backgroundColor: colors.elevated,
    },
  });

  // computed property
  const filteredAddresses = addresses
    .filter(address => filterByAddressType(TABS.INTERNAL, address.isInternal, currentTab))
    .sort(sortByAddressIndex);

  useEffect(() => {
    if (showAddresses) {
      addressList.current.scrollToIndex({ animated: false, index: 0 });
    }
  }, [showAddresses]);

  useLayoutEffect(() => {
    setOptions({
      headerSearchBarOptions: {
        onChangeText: event => setSearch(event.nativeEvent.text),
      },
    });
  }, [setOptions]);

  const getAddresses = () => {
    const newAddresses = [];

    for (let index = 0; index <= walletInstance.next_free_change_address_index; index++) {
      const address = getAddress(walletInstance, index, true);

      newAddresses.push(address);
    }

    for (let index = 0; index < walletInstance.next_free_address_index + walletInstance.gap_limit; index++) {
      const address = getAddress(walletInstance, index, false);

      newAddresses.push(address);
    }

    setAddresses(newAddresses);
    setShowAddresses(true);
  };

  useFocusEffect(
    useCallback(() => {
      enableBlur();
      getAddresses();
      return () => {
        disableBlur();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const data =
    search.length > 0 ? filteredAddresses.filter(item => item.address.toLowerCase().includes(search.toLowerCase())) : filteredAddresses;

  const renderRow = item => {
    return <AddressItem {...item} balanceUnit={balanceUnit} walletID={walletID} allowSignVerifyMessage={allowSignVerifyMessage} />;
  };

  return (
    <View style={[styles.root, stylesHook.root]}>
      <FlatList
        contentContainerStyle={stylesHook.root}
        ref={addressList}
        data={data}
        extraData={data}
        initialNumToRender={20}
        renderItem={renderRow}
        ListEmptyComponent={search.length > 0 ? null : <ActivityIndicator />}
        centerContent={!showAddresses}
        contentInsetAdjustmentBehavior="automatic"
        ListHeaderComponent={<AddressTypeTabs currentTab={currentTab} setCurrentTab={setCurrentTab} />}
      />
    </View>
  );
};

WalletAddresses.navigationOptions = navigationStyle({
  title: loc.addresses.addresses_title,
  statusBarStyle: 'auto',
});

export default WalletAddresses;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
