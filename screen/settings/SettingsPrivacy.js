import React, { useContext, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback } from 'react-native';
import { openSettings } from 'react-native-permissions';

import A from '../../blue_modules/analytics';
import BlueClipboard from '../../blue_modules/clipboard';
import { BlueStorageContext } from '../../blue_modules/storage-context';
import { BlueCard, BlueHeaderDefaultSub, BlueSpacing20, BlueSpacing40, BlueText } from '../../BlueComponents';
import DeviceQuickActions from '../../class/quick-actions';
import ListItem from '../../components/ListItem';
import navigationStyle from '../../components/navigationStyle';
import { useTheme } from '../../components/themes';
import { isBalanceDisplayAllowed, setBalanceDisplayAllowed } from '../../components/WidgetCommunication';
import loc from '../../loc';

const SettingsPrivacy = () => {
  const { colors } = useTheme();
  const { isStorageEncrypted, isDoNotTrackEnabled, setDoNotTrack, setIsPrivacyBlurEnabled } = useContext(BlueStorageContext);
  const sections = Object.freeze({ ALL: 0, CLIPBOARDREAD: 1, QUICKACTION: 2, WIDGETS: 3 });
  const [isLoading, setIsLoading] = useState(sections.ALL);
  const [isReadClipboardAllowed, setIsReadClipboardAllowed] = useState(false);
  const [doNotTrackSwitchValue, setDoNotTrackSwitchValue] = useState(false);

  const [isDisplayWidgetBalanceAllowed, setIsDisplayWidgetBalanceAllowed] = useState(false);
  const [isQuickActionsEnabled, setIsQuickActionsEnabled] = useState(false);
  const [storageIsEncrypted, setStorageIsEncrypted] = useState(true);
  const [isPrivacyBlurEnabledTapped, setIsPrivacyBlurEnabledTapped] = useState(0);
  const styleHooks = StyleSheet.create({
    widgetsHeader: {
      color: colors.foregroundColor,
    },
  });

  useEffect(() => {
    (async () => {
      try {
        isDoNotTrackEnabled().then(setDoNotTrackSwitchValue);
        setIsReadClipboardAllowed(await BlueClipboard().isReadClipboardAllowed());
        setStorageIsEncrypted(await isStorageEncrypted());
        setIsQuickActionsEnabled(await DeviceQuickActions.getEnabled());
        setIsDisplayWidgetBalanceAllowed(await isBalanceDisplayAllowed());
      } catch (e) {
        console.log(e);
      }
      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onValueChange = async value => {
    setIsLoading(sections.CLIPBOARDREAD);
    try {
      await BlueClipboard().setReadClipboardAllowed(value);
      setIsReadClipboardAllowed(value);
    } catch (e) {
      console.log(e);
    }
    setIsLoading(false);
  };

  const onDoNotTrackValueChange = async value => {
    setIsLoading(sections.ALL);
    try {
      await setDoNotTrack(value);
      A.setOptOut(value);
      setDoNotTrackSwitchValue(value);
    } catch (e) {
      console.log(e);
    }
    setIsLoading(false);
  };

  const onQuickActionsValueChange = async value => {
    setIsLoading(sections.QUICKACTION);
    try {
      await DeviceQuickActions.setEnabled(value);
      setIsQuickActionsEnabled(value);
    } catch (e) {
      console.log(e);
    }
    setIsLoading(false);
  };

  const onWidgetsTotalBalanceValueChange = async value => {
    setIsLoading(sections.WIDGETS);
    try {
      await setBalanceDisplayAllowed(value);
      setIsDisplayWidgetBalanceAllowed(value);
    } catch (e) {
      console.log(e);
    }
    setIsLoading(false);
  };

  const stylesWithThemeHook = StyleSheet.create({
    root: {
      backgroundColor: colors.background,
    },
  });

  const openApplicationSettings = () => {
    openSettings();
  };

  const onDisablePrivacyTapped = () => {
    setIsPrivacyBlurEnabled(!(isPrivacyBlurEnabledTapped >= 10));
    setIsPrivacyBlurEnabledTapped(prev => prev + 1);
  };

  return (
    <ScrollView style={[styles.root, stylesWithThemeHook.root]} contentInsetAdjustmentBehavior="automatic" automaticallyAdjustContentInsets>
      <Pressable accessibilityRole="button" onPress={onDisablePrivacyTapped}>
        {Platform.OS === 'android' ? <BlueHeaderDefaultSub leftText={loc.settings.general} /> : <></>}
      </Pressable>
      <ListItem
        hideChevron
        title={loc.settings.privacy_read_clipboard}
        Component={TouchableWithoutFeedback}
        switch={{ onValueChange, value: isReadClipboardAllowed, disabled: isLoading === sections.ALL, testID: 'ClipboardSwitch' }}
      />
      <BlueCard>
        <BlueText>{loc.settings.privacy_clipboard_explanation}</BlueText>
      </BlueCard>
      <BlueSpacing20 />
      {!storageIsEncrypted && (
        <>
          <ListItem
            hideChevron
            title={loc.settings.privacy_quickactions}
            Component={TouchableWithoutFeedback}
            switch={{
              onValueChange: onQuickActionsValueChange,
              value: isQuickActionsEnabled,
              disabled: isLoading === sections.ALL,
              testID: 'QuickActionsSwitch',
            }}
          />
          <BlueCard>
            <BlueText>{loc.settings.privacy_quickactions_explanation}</BlueText>
          </BlueCard>
        </>
      )}
      <ListItem
        hideChevron
        title={loc.settings.privacy_do_not_track}
        Component={TouchableWithoutFeedback}
        switch={{ onValueChange: onDoNotTrackValueChange, value: doNotTrackSwitchValue, disabled: isLoading === sections.ALL }}
      />
      <BlueCard>
        <BlueText>{loc.settings.privacy_do_not_track_explanation}</BlueText>
      </BlueCard>
      {Platform.OS === 'ios' && !storageIsEncrypted && (
        <>
          <BlueSpacing40 />
          <Text adjustsFontSizeToFit style={[styles.widgetsHeader, styleHooks.widgetsHeader]}>
            {loc.settings.widgets}
          </Text>
          <ListItem
            hideChevron
            title={loc.settings.total_balance}
            Component={TouchableWithoutFeedback}
            switch={{
              onValueChange: onWidgetsTotalBalanceValueChange,
              value: isDisplayWidgetBalanceAllowed,
              disabled: isLoading === sections.ALL,
            }}
          />
          <BlueCard>
            <BlueText>{loc.settings.total_balance_explanation}</BlueText>
          </BlueCard>
        </>
      )}
      <BlueSpacing20 />

      <BlueSpacing20 />
      <ListItem title={loc.settings.privacy_system_settings} chevron onPress={openApplicationSettings} testID="PrivacySystemSettings" />
      <BlueSpacing20 />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  widgetsHeader: {
    fontWeight: 'bold',
    fontSize: 30,
    marginLeft: 17,
  },
});

SettingsPrivacy.navigationOptions = navigationStyle({ headerLargeTitle: true }, opts => ({ ...opts, title: loc.settings.privacy }));

export default SettingsPrivacy;
