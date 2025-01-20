import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '../../../src/components';
import { theme } from '../../../src/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore, useAppStore } from '../../../src/store';

export default function SettingsScreen() {
  const user = useAuthStore((state) => state.user);
  const { theme: appTheme, currency, setTheme, setCurrency } = useAppStore();

  const renderSettingItem = (
    icon: string,
    title: string,
    value: string,
    onPress: () => void
  ) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <MaterialCommunityIcons
          name={icon as any}
          size={24}
          color={theme.colors.gray[600]}
        />
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      <View style={styles.settingRight}>
        <Text style={styles.settingValue}>{value}</Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={theme.colors.gray[400]}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        {renderSettingItem(
          'email',
          'Email',
          user?.email || '',
          () => { }
        )}
        {renderSettingItem(
          'account',
          'Display Name',
          user?.displayName || 'Not set',
          () => { }
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        {/* {renderSettingItem(
          'theme-light-dark',
          'Theme',
          appTheme.charAt(0).toUpperCase() + appTheme.slice(1),
          () => { }
        )} */}
        {renderSettingItem(
          'currency-usd',
          'Currency',
          currency,
          () => { }
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        {renderSettingItem(
          'information',
          'Version',
          '1.0.0',
          () => { }
        )}
        {renderSettingItem(
          'shield-check',
          'Privacy Policy',
          '',
          () => { }
        )}
        {renderSettingItem(
          'file-document',
          'Terms of Service',
          '',
          () => { }
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  section: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: theme.typography.medium,
    color: theme.colors.gray[600],
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: theme.typography.regular,
    color: theme.colors.black,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  settingValue: {
    fontSize: 16,
    fontFamily: theme.typography.regular,
    color: theme.colors.gray[600],
  },
}); 