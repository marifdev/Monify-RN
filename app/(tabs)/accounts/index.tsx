import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Text } from '../../../src/components';
import { theme } from '../../../src/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAccounts } from '../../../src/hooks/useAccounts';
import { Account } from '../../../src/types';
import { useCurrency } from '../../../src/hooks/useCurrency';

export default function AccountsScreen() {
  const { accounts, loading, getTotalBalance } = useAccounts();
  const { format } = useCurrency();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const cashAccounts = accounts.filter(account => account.type === 'CASH');
  const creditCards = accounts.filter(account => account.type === 'CREDIT_CARD');
  const bankAccounts = accounts.filter(account =>
    ['BANK', 'SAVINGS', 'INVESTMENT'].includes(account.type)
  );

  const renderAccountCard = (account: Account) => (
    <TouchableOpacity
      key={account.id}
      style={styles.accountCard}
      onPress={() => {
        // TODO: Navigate to account details
        console.log('Navigate to account', account.id);
      }}
    >
      <View style={styles.accountHeader}>
        <MaterialCommunityIcons
          name="cash"
          size={20}
          color={theme.colors.gray[600]}
        />
        <Text style={styles.accountName}>{account.name}</Text>
      </View>
      <Text style={styles.accountBalance}>
        {format(account.balance)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text variant="medium" style={styles.totalLabel}>
            Total Balance
          </Text>
          <Text variant="bold" style={styles.totalBalance}>
            {format(getTotalBalance())}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.incomeButton]}
            onPress={() => router.push('/add-transaction?type=income')}
          >
            <MaterialCommunityIcons name="arrow-up" size={24} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>Income</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.expenseButton]}
            onPress={() => router.push('/add-transaction?type=expense')}
          >
            <MaterialCommunityIcons name="arrow-down" size={24} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.transferButton]}
            onPress={() => router.push('/add-transaction?type=transfer')}
          >
            <MaterialCommunityIcons name="arrow-right" size={24} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>Transfer</Text>
          </TouchableOpacity>
        </View>

        {/* Cash Accounts */}
        {cashAccounts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cash</Text>
            <View style={styles.accountsGrid}>
              {cashAccounts.map(renderAccountCard)}
            </View>
          </View>
        )}

        {/* Credit Cards */}
        {creditCards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Credit Cards</Text>
            <View style={styles.accountsGrid}>
              {creditCards.map(renderAccountCard)}
            </View>
          </View>
        )}

        {/* Bank Accounts */}
        {bankAccounts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bank Accounts</Text>
            <View style={styles.accountsGrid}>
              {bankAccounts.map(renderAccountCard)}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
  },
  totalLabel: {
    fontSize: 16,
    color: theme.colors.gray[600],
    marginBottom: 4,
  },
  totalBalance: {
    fontSize: 40,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  actionButton: {
    flex: 1,
    height: 44,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  actionButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontFamily: theme.typography.medium,
  },
  incomeButton: {
    backgroundColor: theme.colors.primary,
  },
  expenseButton: {
    backgroundColor: theme.colors.red,
  },
  transferButton: {
    backgroundColor: theme.colors.blue,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: theme.typography.bold,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  accountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  accountCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    width: '47%', // Slightly less than 50% to account for gap
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  accountName: {
    fontSize: 16,
    fontFamily: theme.typography.medium,
    color: theme.colors.gray[600],
  },
  accountBalance: {
    fontSize: 20,
    fontFamily: theme.typography.bold,
  },
});
