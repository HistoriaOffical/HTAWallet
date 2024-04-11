import './shim.js';

import React, { useEffect } from 'react';
import { AppRegistry } from 'react-native';

import App from './App';
import A from './blue_modules/analytics';
import { BlueStorageProvider } from './blue_modules/storage-context';

if (!Error.captureStackTrace) {
  // captureStackTrace is only available when debugging
  Error.captureStackTrace = () => {};
}

const BlueAppComponent = () => {
  useEffect(() => {
    A(A.ENUM.INIT);
  }, []);

  return (
    <BlueStorageProvider>
      <App />
    </BlueStorageProvider>
  );
};

AppRegistry.registerComponent('BlueWallet', () => BlueAppComponent);
