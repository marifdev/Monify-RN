import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Text } from '../../../src/components';
import { theme } from '../../../src/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore, useAuthStore } from '../../../src/store';
import { router } from 'expo-router';
import { updateUserSettings } from '../../../src/services/user';
import { useState } from 'react';
import { CURRENCIES } from '../../../src/constants';

export default function CurrencyScreen() {
  const { currency, setCurrency } = useAppStore();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCurrencySelect = async (currencyCode: string) => {
    try {
      setLoading(true);
      setError('');

      // Update local state
      setCurrency(currencyCode);

      // Update Firestore
      if (user) {
        await updateUserSettings(user.id, {
          currency: currencyCode,
        });
      }

      router.back();
    } catch (err) {
      console.error('Error updating currency:', err);
      setError('Failed to update currency. Please try again.');
      // Revert local state on error
      setCurrency(currency);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}

      {CURRENCIES.map((curr) => (
        <TouchableOpacity
          key={curr.code}
          style={styles.currencyItem}
          onPress={() => handleCurrencySelect(curr.code)}
          disabled={loading}
        >
          <View style={styles.currencyInfo}>
            <Text style={styles.currencySymbol}>{curr.symbol}</Text>
            <View>
              <Text style={styles.currencyCode}>{curr.code}</Text>
              <Text style={styles.currencyName}>{curr.name}</Text>
            </View>
          </View>
          <View style={styles.rightContent}>
            {loading && currency === curr.code ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : currency === curr.code ? (
              <MaterialCommunityIcons
                name="check"
                size={24}
                color={theme.colors.primary}
              />
            ) : null}
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
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  currencySymbol: {
    fontSize: 20,
    fontFamily: theme.typography.medium,
    color: theme.colors.black,
    width: 32,
    textAlign: 'center',
  },
  currencyCode: {
    fontSize: 16,
    fontFamily: theme.typography.medium,
    color: theme.colors.black,
  },
  currencyName: {
    fontSize: 14,
    fontFamily: theme.typography.regular,
    color: theme.colors.gray[600],
  },
  error: {
    color: theme.colors.red,
    textAlign: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.sm,
  },
  rightContent: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 