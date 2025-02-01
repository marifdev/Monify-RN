import { View, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../../../src/components';
import { theme } from '../../../src/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTransactions } from '../../../src/hooks/useTransactions';
import { useAccounts } from '../../../src/hooks/useAccounts';
import { TRANSACTION_CATEGORIES, TransactionCategory } from '../../../src/types/index';
import { useCurrency } from '../../../src/hooks/useCurrency';

export default function TransactionsScreen() {
  const { transactions, loading } = useTransactions();
  const { accounts } = useAccounts();
  const { format } = useCurrency();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="swap-horizontal"
            size={48}
            color={theme.colors.gray[400]}
          />
          <Text style={styles.emptyStateText}>No transactions yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Your transactions will appear here
          </Text>
        </View>
      </View>
    );
  }

  const getAccountName = (accountId: string) => {
    return accounts.find(acc => acc.id === accountId)?.name || 'Unknown Account';
  };

  const getTransactionIcon = (type: string, category: TransactionCategory): keyof typeof MaterialCommunityIcons.glyphMap => {
    if (type === 'transfer') return 'bank-transfer';
    return (TRANSACTION_CATEGORIES[category]?.icon || 'help-circle') as keyof typeof MaterialCommunityIcons.glyphMap;
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'income':
        return theme.colors.primary;
      case 'expense':
        return theme.colors.red;
      case 'transfer':
        return theme.colors.blue;
      default:
        return theme.colors.gray[600];
    }
  };

  return (
    <ScrollView style={styles.container}>
      {transactions.map((transaction) => (
        <TouchableOpacity
          key={transaction.id}
          style={styles.transactionItem}
          onPress={() => {
            // TODO: Show transaction details
            console.log('Transaction details:', transaction);
          }}
        >
          <View style={styles.transactionIcon}>
            <MaterialCommunityIcons
              name={getTransactionIcon(transaction.type, transaction.category)}
              size={24}
              color={getTransactionColor(transaction.type)}
            />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionTitle}>
              {TRANSACTION_CATEGORIES[transaction.category].label}
            </Text>
            <Text style={styles.transactionDescription}>
              {transaction.description}
            </Text>
            <Text style={styles.transactionMeta}>
              {transaction.type === 'transfer'
                ? `${getAccountName(transaction.fromAccountId!)} → ${getAccountName(transaction.toAccountId!)}`
                : getAccountName(transaction.accountId!)}
            </Text>
          </View>
          <View style={styles.transactionAmount}>
            <Text
              style={[
                styles.amountText,
                { color: getTransactionColor(transaction.type) },
              ]}
            >
              {transaction.type === 'expense' ? '-' : ''}
              {format(transaction.amount)}
            </Text>
            <Text style={styles.dateText}>
              {transaction.date.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
              })}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl * 2,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: theme.typography.medium,
    color: theme.colors.gray[600],
    marginTop: theme.spacing.md,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: theme.typography.regular,
    color: theme.colors.gray[500],
    marginTop: theme.spacing.xs,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  transactionInfo: {
    flex: 1,
    gap: 2,
  },
  transactionTitle: {
    fontSize: 16,
    fontFamily: theme.typography.medium,
    color: theme.colors.black,
  },
  transactionDescription: {
    fontSize: 14,
    fontFamily: theme.typography.regular,
    color: theme.colors.gray[600],
  },
  transactionMeta: {
    fontSize: 14,
    fontFamily: theme.typography.regular,
    color: theme.colors.gray[600],
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontFamily: theme.typography.medium,
  },
  dateText: {
    fontSize: 12,
    fontFamily: theme.typography.regular,
    color: theme.colors.gray[500],
    marginTop: 2,
  },
}); 