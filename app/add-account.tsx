import { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Text } from '../src/components';
import { theme } from '../src/theme';
import { useAccounts } from '../src/hooks/useAccounts';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Account, AccountType } from '../src/types';
import { StatusBar } from 'expo-status-bar';

const ACCOUNT_TYPES = {
  CASH: { label: 'Cash', icon: 'cash' },
  BANK: { label: 'Bank', icon: 'bank' },
  CREDIT_CARD: { label: 'Credit Card', icon: 'credit-card' },
} as const;

export default function AddAccountScreen() {
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

      const balanceNumber = balance.trim() ? parseFloat(balance) : 0;
      if (balance.trim() && isNaN(balanceNumber)) {
        setError('Invalid balance amount');
        return;
      }

      await addAccount({
        name: name.trim(),
        balance: balanceNumber,
        type,
        currency: 'TRY',
        isArchived: false,
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
      <View style={styles.form}>
        <Text style={styles.label}>Account Type</Text>
        <View style={styles.typeContainer}>
          {Object.entries(ACCOUNT_TYPES).map(([key, value]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.typeOption,
                type === key && {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                }
              ]}
              onPress={() => setType(key as AccountType)}
            >
              <MaterialCommunityIcons
                name={value.icon as any}
                size={24}
                color={type === key ? theme.colors.white : theme.colors.gray[600]}
              />
              <Text
                style={[
                  styles.typeLabel,
                  type === key && { color: theme.colors.white }
                ]}
                numberOfLines={2}
              >
                {value.label}
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
            {loading ? 'Adding...' : 'Add Account'}
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
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
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
  typeContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  typeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    backgroundColor: theme.colors.white,
    flexDirection: 'column',
    gap: theme.spacing.sm,
    minHeight: 90,
  },
  typeLabel: {
    fontSize: 14,
    fontFamily: theme.typography.medium,
    color: theme.colors.gray[600],
    textAlign: 'center',
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
  button: {
    height: 52,
    backgroundColor: theme.colors.primary,
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
}); 