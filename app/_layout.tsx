import { useEffect, useState } from 'react';
import { Slot, Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore, useAppStore } from '../src/store';
import { auth } from '../src/services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../src/services/firebase';
import {
  useFonts,
  RobotoSlab_400Regular,
  RobotoSlab_500Medium,
  RobotoSlab_700Bold,
} from '@expo-google-fonts/roboto-slab';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const { user, setUser } = useAuthStore();
  const { setCurrency } = useAppStore();
  const router = useRouter();
  const segments = useSegments();
  const [fontsLoaded] = useFonts({
    RobotoSlab_400Regular,
    RobotoSlab_500Medium,
    RobotoSlab_700Bold,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userSettings = userDoc.exists() ? userDoc.data().settings : {
            currency: 'USD',
            theme: 'system' as const,
            notifications: true,
          };

          // Update app settings
          setCurrency(userSettings.currency);

          // Set user data
          const userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || undefined,
            photoURL: firebaseUser.photoURL || undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
            settings: userSettings,
          };
          setUser(userData);
        } catch (error) {
          console.error('Error loading user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const isSignInPage = segments[0] === 'sign-in';
    const isSignUpPage = segments[0] === 'sign-up';
    const isAddAccountPage = segments[0] === 'add-account';
    const isAddTransactionPage = segments[0] === 'add-transaction';
    if (!user) {
      // If user is not authenticated and not on sign-in/sign-up page, redirect to sign-in
      if (!isSignInPage && !isSignUpPage) {
        router.replace('/sign-in');
      }
    } else {
      // If user is authenticated
      if (!inAuthGroup && !isAddAccountPage && !isAddTransactionPage) {
        router.replace('/(tabs)/accounts');
      }
    }

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [user, initializing, segments, fontsLoaded]);

  // Show loading screen while fonts are loading or initializing
  if (!fontsLoaded || initializing) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack >
        <Stack.Screen name="(tabs)" options={{ headerShown: false, headerTitle: 'Accounts' }} />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" />
        <Stack.Screen
          name="add-account"
          options={{
            headerShown: true,
            title: 'Add Account',
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="add-transaction"
          options={{
            headerShown: true,
            headerShadowVisible: false,
            headerStyle: {
              backgroundColor: 'transparent',
            },
            headerTintColor: '#FFFFFF',
            headerTransparent: false,
          }}
        />
      </Stack>
    </>
  );
}

