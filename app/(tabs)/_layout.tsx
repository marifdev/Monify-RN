import { Stack, Tabs, router } from 'expo-router';
import { View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from '../../src/services/firebase';
import { signOut } from 'firebase/auth';
import { theme } from '../../src/theme';

export default function TabsLayout() {
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Tabs>
      <Tabs.Screen name="accounts" options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="bank" color={color} size={size} />
        ),
        title: 'Accounts',
        headerRight: () => (
          <TouchableOpacity
            style={{ marginRight: 16 }}
            onPress={() => router.push('/accounts/add-account')}>
            <MaterialCommunityIcons
              name="plus"
              size={24}
              color={theme.colors.black}
            />
          </TouchableOpacity>
        ),
      }} />
      <Tabs.Screen name="transactions" options={{
        title: 'Transactions',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="cash-register" color={color} size={size} />
        )
      }} />
      <Tabs.Screen name="settings" options={{
        title: 'Settings',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="cog" color={color} size={size} />
        ),
        headerRight: () => (
          <TouchableOpacity onPress={logout} style={{ marginRight: 16 }}>
            <MaterialCommunityIcons
              name="logout"
              size={24}
              color={theme.colors.black}
            />
          </TouchableOpacity>
        ),
      }} />
    </Tabs>
  );
} 