import { Stack, Tabs } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from '../../../src/services/firebase';
import { signOut } from 'firebase/auth';
import { theme } from '../../../src/theme';

export default function TransactionsLayout() {
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
} 