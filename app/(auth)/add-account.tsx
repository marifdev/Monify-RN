import { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Text } from '../../src/components';
import { theme } from '../../src/theme';
import { useAccounts } from '../../src/hooks/useAccounts';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Account, AccountType } from '../../src/types';

const ACCOUNT_TYPES: { type: AccountType; label: string; icon: string }[] = [
  { type: 'CASH', label: 'Cash', icon: 'cash' },
  { type: 'BANK', label: 'Bank Account', icon: 'bank' },
  { type: 'CREDIT_CARD', label: 'Credit Card', icon: 'credit-card' },
  { type: 'SAVINGS', label: 'Savings', icon: 'piggy-bank' },
  { type: 'INVESTMENT', label: 'Investment', icon: 'chart-line' },
];

export default function AddAccountModal() {
  const { addAccount } = useAccounts();
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [type, setType] = useState<AccountType>('CASH');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      setError('');
      setLoading(true);

      if (!name.trim()) {
        setError('Account name is required');
        return;
      }

      if (!balance.trim()) {
        setError('Initial balance is required');
        return;
      }

      const balanceNumber = parseFloat(balance);
      if (isNaN(balanceNumber)) {
        setError('Invalid balance amount');
        return;
      }

      await addAccount({
        name: name.trim(),
        balance: balanceNumber,
        type,
        currency: 'USD',
      } as Account);

      router.back();
    } catch (err) {
      console.error('Error adding account:', err);
      setError(err instanceof Error ? err.message : 'Failed to add account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Account</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <MaterialCommunityIcons name="close" size={24} color={theme.colors.black} />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Account Type</Text>
      <View style={styles.typeContainer}>
        {ACCOUNT_TYPES.map((accountType) => (
          <TouchableOpacity
            key={accountType.type}
            style={[
              styles.typeButton,
              type === accountType.type && styles.selectedType,
            ]}
            onPress={() => setType(accountType.type)}
          >
            <MaterialCommunityIcons
              name={accountType.icon as any}
              size={24}
              color={type === accountType.type ? theme.colors.white : theme.colors.black}
            />
            <Text
              style={[
                styles.typeLabel,
                type === accountType.type && styles.selectedTypeLabel,
              ]}
            >
              {accountType.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Account Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Enter account name"
        style={styles.input}
        placeholderTextColor={theme.colors.gray[500]}
      />

      <Text style={styles.label}>Initial Balance</Text>
      <TextInput
        value={balance}
        onChangeText={setBalance}
        placeholder="0.00"
        keyboardType="decimal-pad"
        style={styles.input}
        placeholderTextColor={theme.colors.gray[500]}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Adding Account...' : 'Add Account'}
        </Text>
      </TouchableOpacity>
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
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  title: {
    fontSize: 20,
    fontFamily: theme.typography.bold,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  label: {
    fontSize: 16,
    fontFamily: theme.typography.medium,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
  },
  input: {
    height: 52,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    fontSize: 16,
    fontFamily: theme.typography.regular,
    color: theme.colors.black,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  selectedType: {
    backgroundColor: theme.colors.primary,
  },
  typeLabel: {
    fontSize: 14,
    fontFamily: theme.typography.medium,
    color: theme.colors.black,
    textAlign: 'center',
  },
  selectedTypeLabel: {
    color: theme.colors.white,
  },
  button: {
    height: 52,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    margin: theme.spacing.md,
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
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    fontFamily: theme.typography.regular,
  },
}); 