import { View, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from '../../src/components';
import { theme } from '../../src/theme';
import { useAccounts } from '../../src/hooks/useAccounts';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ACCOUNT_ICONS = {
  CASH: 'cash',
  BANK: 'bank',
  CREDIT_CARD: 'credit-card',
  SAVINGS: 'piggy-bank',
  INVESTMENT: 'chart-line',
} as const;

export default function AccountsScreen() {
  const { accounts, loading, getTotalBalance } = useAccounts();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text variant="medium" style={styles.totalLabel}>Total Balance</Text>
          <Text variant="bold" style={styles.totalBalance}>
            ${getTotalBalance().toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-account')}
        >
          <MaterialCommunityIcons
            name="plus"
            size={24}
            color={theme.colors.white}
          />
        </TouchableOpacity>
      </View>

      {accounts.map((account) => (
        <TouchableOpacity
          key={account.id}
          style={styles.card}
          onPress={() => {
            // TODO: Navigate to account details
            console.log('Navigate to account', account.id);
          }}
        >
          <View style={styles.accountContent}>
            <View style={styles.accountInfo}>
              <MaterialCommunityIcons
                name={ACCOUNT_ICONS[account.type]}
                size={24}
                color={theme.colors.primary}
                style={styles.accountIcon}
              />
              <View>
                <Text variant="medium" style={styles.accountName}>
                  {account.name}
                </Text>
                <Text style={styles.accountType}>
                  {account.type.replace('_', ' ')}
                </Text>
              </View>
            </View>
            <Text
              variant="bold"
              style={[
                styles.balance,
                account.type === 'CREDIT_CARD' && account.balance > 0 && styles.negativeBalance,
              ]}
            >
              {account.type === 'CREDIT_CARD' && account.balance > 0 ? '-' : ''}
              ${Math.abs(account.balance).toFixed(2)}
            </Text>
          </View>
        </TouchableOpacity>
      ))}

      {accounts.length === 0 && (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="bank-plus"
            size={48}
            color={theme.colors.gray[400]}
          />
          <Text style={styles.emptyStateText}>
            No accounts yet. Tap the + button to add one.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  totalLabel: {
    fontSize: 16,
    color: theme.colors.gray[600],
    marginBottom: 4,
  },
  totalBalance: {
    fontSize: 32,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.white,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accountContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountIcon: {
    marginRight: theme.spacing.sm,
  },
  accountName: {
    fontSize: 18,
    marginBottom: 4,
  },
  accountType: {
    fontSize: 14,
    color: theme.colors.gray[600],
  },
  balance: {
    fontSize: 20,
  },
  negativeBalance: {
    color: theme.colors.red,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyStateText: {
    marginTop: theme.spacing.md,
    color: theme.colors.gray[600],
    textAlign: 'center',
  },
});
