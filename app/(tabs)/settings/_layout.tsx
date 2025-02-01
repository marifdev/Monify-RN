import { Stack } from 'expo-router';
import { theme } from '../../../src/theme';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Settings',
          headerStyle: {
            backgroundColor: theme.colors.white,
          },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="currency"
        options={{
          title: 'Currency',
          headerStyle: {
            backgroundColor: theme.colors.white,
          },
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
} 