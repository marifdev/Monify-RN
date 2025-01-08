import { useEffect, useState } from 'react';
import { Slot, Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../src/store';
import { auth } from '../src/services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  useFonts,
  RobotoSlab_400Regular,
  RobotoSlab_500Medium,
  RobotoSlab_700Bold,
} from '@expo-google-fonts/roboto-slab';
import { theme } from '../src/theme';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const [fontsLoaded] = useFonts({
    RobotoSlab_400Regular,
    RobotoSlab_500Medium,
    RobotoSlab_700Bold,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('firebaseUser', firebaseUser);
      if (firebaseUser) {
        // User is signed in
        const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || undefined,
          photoURL: firebaseUser.photoURL || undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          settings: {
            currency: 'USD',
            theme: 'system' as const,
            notifications: true,
          },
        };
        setUser(userData);
      } else {
        setUser(null);
      }
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isSignInPage = segments[0] === 'sign-in';
    const isSignUpPage = segments[0] === 'sign-up';
    console.log('segments', segments);
    if (user) {
      // If user is authenticated and not in auth group, redirect to auth
      if (!inAuthGroup) {
        console.log('Redirecting to auth group');
        router.replace('/(auth)');
      }
    } else {
      // If user is not authenticated and not on sign-in/sign-up page, redirect to sign-in
      if (!isSignInPage && !isSignUpPage) {
        console.log('Redirecting to sign-in');
        router.replace('/sign-in');
      }
    }

    SplashScreen.hideAsync();
  }, [user, initializing, segments]);

  // Show loading screen while fonts are loading
  if (!fontsLoaded || initializing) {
    return <Slot />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}
