import { Stack, Tabs } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from '../../../src/services/firebase';
import { signOut } from 'firebase/auth';
import { theme } from '../../../src/theme';

export default function AccountsLayout() {
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
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add-account"
        options={{
          presentation: 'modal',
          title: 'Add Account',
          headerRight: () => (
            <TouchableOpacity onPress={logout} style={{ marginRight: 16 }}>
              <MaterialCommunityIcons
                name="logout"
                size={24}
                color={theme.colors.black}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="add-transaction"
        options={{
          presentation: 'modal',
          title: 'Add Transaction',
          headerShown: false,
        }}
      />
    </Stack>
  );
} 