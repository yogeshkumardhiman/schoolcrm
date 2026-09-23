/**
 * @format
 */

import { AppRegistry } from 'react-native';
// import App from './App';
import App from './src/App';
import { name as appName } from './app.json';

// 🔔 BACKGROUND / TERMINATED STATE PUSH NOTIFICATION HANDLER
// This runs even when the app is completely closed (bnd)
import messaging from '@react-native-firebase/messaging';
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📬 [FCM Background] Notification received while app was closed:', remoteMessage.notification?.title);
});

AppRegistry.registerComponent(appName, () => App);

