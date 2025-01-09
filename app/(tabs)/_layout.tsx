import { Stack, Tabs } from 'expo-router';
import { TouchableOpacity } from 'react-native';
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
        title: 'Accounts', headerRight: () => (
          <TouchableOpacity onPress={logout} style={{ marginRight: 16 }}>
            <MaterialCommunityIcons
              name="logout"
              size={24}
              color={theme.colors.black}
            />
          </TouchableOpacity>
        ),
      }} />
      <Tabs.Screen name="transactions" options={{ title: 'Transactions' }} />
    </Tabs>
  );
} 