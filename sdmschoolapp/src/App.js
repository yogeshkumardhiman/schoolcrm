import React, { useState, useEffect } from 'react';
import { StatusBar, AppState, PermissionsAndroid, Platform } from 'react-native';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from 'react-error-boundary';
import { store, persistor } from './store';
import AppNavigator from './navigation/routes';
import { CACHE, CACHE_PARAMS } from './utils';
import { fetchAppConfiguration } from './slices/configSlice';
import messaging from '@react-native-firebase/messaging';
import { APIService } from './services/APIServices';
import SplashScreen from './screens/public/SplashScreen';
import ErrorFallbackScreen from './components/ErrorFallbackScreen';
import { navigate } from './navigation/navigationService';

const apiService = new APIService();



const syncDeviceTokenWithBackend = async (fcmToken) => {
  try {
    await apiService.syncDeviceToken(fcmToken);
    console.log('✅ [FCM Sync] Device token successfully synced to server.');
  } catch (e) {
    console.warn('[FCM Sync] Failed to sync token — user may not be logged in yet:', e.message);
  }
};

const AppToast = () => {
  const { primaryColor } = useSelector(state => state.config || {});

  const toastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: primaryColor || '#10B981', backgroundColor: '#FFFFFF' }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 14,
          fontWeight: 'bold',
          color: '#1F2937'
        }}
        text2Style={{
          fontSize: 12,
          color: '#6B7280'
        }}
      />
    ),
    error: (props) => (
      <ErrorToast
        {...props}
        style={{ borderLeftColor: '#EF4444', backgroundColor: '#FFFFFF' }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 14,
          fontWeight: 'bold',
          color: '#1F2937'
        }}
        text2Style={{
          fontSize: 12,
          color: '#6B7280'
        }}
      />
    ),
    info: (props) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: primaryColor || '#3B82F6', backgroundColor: '#FFFFFF' }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 14,
          fontWeight: 'bold',
          color: '#1F2937'
        }}
        text2Style={{
          fontSize: 12,
          color: '#6B7280'
        }}
      />
    )
  };

  return <Toast config={toastConfig} />;
};

const App = () => {
  const [showBoarding, setShowBoarding] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("⚓ Initializing Institutional Hub...");
        
        // --- 🎨 FETCH SERVER BRANDING CONFIGS ---
        store.dispatch(fetchAppConfiguration());
        
        // --- 🏄 CHECK ONBOARDING STATUS ---
        const onboardingValue = await CACHE.get(CACHE_PARAMS.onboarding);
        const existingToken = await CACHE.get(CACHE_PARAMS.accessToken);
        
        if (onboardingValue !== null || existingToken) {
          setShowBoarding(false);
          if (!onboardingValue) await CACHE.set(CACHE_PARAMS.onboarding, true);
        }

        // Note: Institutional Session is now managed by Redux Persist
        console.log("🚀 Redux Persist Active - Rehydrating session...");

        // --- 🔔 FIREBASE CLOUD MESSAGING SETUP ---
        try {
          if (Platform.OS === 'android' && Platform.Version >= 33) {
            const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
              console.warn('⚠️ [FCM] Android 13+ Push Notification Permission Denied by User.');
            }
          }

          const authStatus = await messaging().requestPermission();
          const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

          if (enabled) {
            console.log('✅ [FCM] Push notification permission granted:', authStatus);
            const fcmToken = await messaging().getToken();
            console.log('📱 [FCM] Device Token:', fcmToken ? (fcmToken.substring(0, 20) + '...') : 'NULL');
            if (fcmToken) {
              await syncDeviceTokenWithBackend(fcmToken);
            }
          } else {
            console.log('⚠️ [FCM] Push notification permission denied.');
          }
        } catch (fcmErr) {
          console.warn('[FCM Setup Error]:', fcmErr.message);
        }

      } catch (e) {
        console.log("⚓ Initialization Protocol Failure:", e);
      } finally {
        // Ensure minimum splash time for branding
        setTimeout(() => {
          setIsInitializing(false);
        }, 2000);
      }
    };
    initializeApp();

    // --- 📡 BATTERY-EFFICIENT REAL-TIME BRANDING DYNAMICS SYNC ---
    // Instead of heavy looping polling, we listen to the system's AppState!
    // Whenever the app resumes from the background to the foreground (active), we trigger a single sync fetch!
    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        console.log("⚓ App resumed from background - Triggering dynamic configs sync...");
        store.dispatch(fetchAppConfiguration());
      }
    });

    // --- 📲 FOREGROUND NOTIFICATION HANDLER ---
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('📬 [FCM Foreground] Notification received:', remoteMessage.notification?.title);
      Toast.show({
        type: 'info',
        text1: remoteMessage.notification?.title || 'New Notification',
        text2: remoteMessage.notification?.body || '',
        visibilityTime: 4000,
        onPress: () => {
          Toast.hide();
          navigate('NoticeScreen');
        }
      });
    });

    // --- 📲 BACKGROUND NOTIFICATION TAPPED HANDLER ---
    const unsubscribeBackground = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('📬 [FCM Opened] App opened from background by tap:', remoteMessage.notification?.title);
      navigate('NoticeScreen');
    });

    // --- 📲 KILLED NOTIFICATION TAPPED HANDLER ---
    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        console.log('📬 [FCM Initial] App opened from quit state by tap:', remoteMessage.notification?.title);
        // Add a slight delay for app initialization to ensure navigation is ready
        setTimeout(() => {
          navigate('NoticeScreen');
        }, 1000);
      }
    });

    return () => {
      appStateSubscription.remove();
      unsubscribeForeground();
      unsubscribeBackground();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate loading={<SplashScreen />} persistor={persistor}>
          <ErrorBoundary 
            FallbackComponent={ErrorFallbackScreen}
            onReset={() => {
              console.log("⚓ Error Boundary reset triggered - re-syncing configurations...");
              store.dispatch(fetchAppConfiguration());
            }}
          >
            <StatusBar barStyle="dark-content" />
            {isInitializing ? (
              <SplashScreen />
            ) : (
              <AppNavigator showBoarding={showBoarding} />
            )}
            <AppToast />
          </ErrorBoundary>
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;




