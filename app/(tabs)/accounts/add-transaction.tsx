import { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '../../../src/components';
import { theme } from '../../../src/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAccounts } from '../../../src/hooks/useAccounts';
import { Account, TransactionType, TransactionCategory, TRANSACTION_CATEGORIES } from '../../../src/types';
import { StatusBar } from 'expo-status-bar';
import { useTransactions } from '../../../src/hooks/useTransactions';

const TRANSACTION_TYPES: Record<TransactionType, { title: string; icon: string; color: string }> = {
  income: {
    title: 'Gelir Ekle',
    icon: 'arrow-up',
    color: theme.colors.primary,
  },
  expense: {
    title: 'Gider Ekle',
    icon: 'arrow-down',
    color: theme.colors.red,
  },
  transfer: {
    title: 'Transfer',
    icon: 'arrow-right',
    color: theme.colors.blue,
  },
};

export default function AddTransactionScreen() {
  const params = useLocalSearchParams<{ type: TransactionType }>();
  const type = params.type as TransactionType;
  const config = TRANSACTION_TYPES[type];
  const { accounts } = useAccounts();
  const { addTransaction } = useTransactions();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [selectedToAccount, setSelectedToAccount] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory>('other');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      setError('');
      setLoading(true);

      if (!amount.trim()) {
        setError('Amount is required');
        return;
      }

      const amountNumber = parseFloat(amount);
      if (isNaN(amountNumber)) {
        setError('Invalid amount');
        return;
      }

      if (!selectedAccount) {
        setError(type === 'transfer' ? 'Please select source account' : 'Please select account');
        return;
      }

      if (type === 'transfer' && !selectedToAccount) {
        setError('Please select destination account');
        return;
      }

      if (!description.trim()) {
        setError('Description is required');
        return;
      }

      const transactionData = {
        type,
        amount: amountNumber,
        description: description.trim(),
        date: new Date(),
        category: selectedCategory,
        status: 'completed' as const,
        accountId: selectedAccount!,
        ...(type === 'transfer' && {
          fromAccountId: selectedAccount,
          toAccountId: selectedToAccount!,
        }),
      };

      await addTransaction(transactionData);
      router.back();
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const renderAccountOption = (account: Account, isSelected: boolean, onPress: () => void) => (
    <TouchableOpacity
      key={account.id}
      style={[
        styles.accountOption,
        isSelected && { backgroundColor: config.color, borderColor: config.color }
      ]}
      onPress={onPress}
    >
      <MaterialCommunityIcons
        name="bank"
        size={20}
        color={isSelected ? theme.colors.white : theme.colors.gray[600]}
      />
      <View>
        <Text style={[
          styles.accountName,
          isSelected && { color: theme.colors.white }
        ]}>
          {account.name}
        </Text>
        <Text style={[
          styles.accountBalance,
          isSelected && { color: theme.colors.white }
        ]}>
          ₺{account.balance.toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="light" />
      <View style={[styles.header, { backgroundColor: config.color }]}>
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name={config.icon as any} size={24} color={theme.colors.white} />
          <Text style={styles.title}>{config.title}</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <MaterialCommunityIcons name="close" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Amount</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
          style={styles.input}
          placeholderTextColor={theme.colors.gray[500]}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description"
          style={styles.input}
          placeholderTextColor={theme.colors.gray[500]}
        />

        <Text style={styles.label}>{type === 'transfer' ? 'From Account' : 'Account'}</Text>
        <View style={styles.accountsGrid}>
          {accounts.map(account => renderAccountOption(
            account,
            selectedAccount === account.id,
            () => setSelectedAccount(account.id)
          ))}
        </View>

        {type === 'transfer' && (
          <>
            <Text style={styles.label}>To Account</Text>
            <View style={styles.accountsGrid}>
              {accounts
                .filter(account => account.id !== selectedAccount)
                .map(account => renderAccountOption(
                  account,
                  selectedToAccount === account.id,
                  () => setSelectedToAccount(account.id)
                ))}
            </View>
          </>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: config.color }, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Adding...' : 'Add'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: 20,
    fontFamily: theme.typography.bold,
    color: theme.colors.white,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  form: {
    padding: theme.spacing.md,
  },
  label: {
    fontSize: 16,
    fontFamily: theme.typography.medium,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  input: {
    height: 52,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: 16,
    fontFamily: theme.typography.regular,
    color: theme.colors.black,
  },
  accountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  accountOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    minWidth: '48%',
  },
  accountName: {
    fontSize: 14,
    fontFamily: theme.typography.medium,
    color: theme.colors.black,
  },
  accountBalance: {
    fontSize: 12,
    fontFamily: theme.typography.regular,
    color: theme.colors.gray[600],
  },
  button: {
    height: 52,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontFamily: theme.typography.bold,
  },
  error: {
    color: theme.colors.red,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    fontFamily: theme.typography.regular,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginHorizontal: -theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  categoryOption: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    marginRight: theme.spacing.sm,
    minWidth: 80,
  },
  categoryLabel: {
    fontSize: 12,
    fontFamily: theme.typography.medium,
    color: theme.colors.gray[600],
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
}); 