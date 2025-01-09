import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { Account, AccountSchema } from '../types';
import { useAuthStore } from '../store';

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);

  const fetchAccounts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const accountsCollectionRef = collection(db, `users/${user.id}/accounts`);
      console.log('Fetching accounts for user:', user.id);
      const accountsSnapshot = await getDocs(accountsCollectionRef);

      const accountsList = accountsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
        } as Account;
      });
      console.log('Accounts fetched:', accountsList.length);

      setAccounts(accountsList);
      setError(null);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  // Fetch accounts when user changes
  useEffect(() => {
    if (user) {
      fetchAccounts();
    } else {
      setAccounts([]);
    }
  }, [user]);

  // Fetch accounts when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        console.log('Screen focused, fetching accounts');
        fetchAccounts();
      }
    }, [user])
  );

  const addAccount = async (accountData: Omit<Account, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const newAccount = {
        ...accountData,
        userId: user.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isArchived: false,
      };

      const accountsCollectionRef = collection(db, `users/${user.id}/accounts`);
      const docRef = await addDoc(accountsCollectionRef, newAccount);
      console.log('Account added with ID:', docRef.id);

      return docRef.id;
    } catch (err) {
      console.error('Error adding account:', err);
      throw err instanceof Error ? err : new Error('Failed to add account');
    }
  };

  const updateAccount = async (accountId: string, updates: Partial<Account>) => {
    try {
      const accountRef = doc(db, `users/${user!.id}/accounts`, accountId);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(accountRef, updateData);
      console.log('Account updated:', accountId);
      await fetchAccounts();
    } catch (err) {
      console.error('Error updating account:', err);
      throw err instanceof Error ? err : new Error('Failed to update account');
    }
  };

  const archiveAccount = async (accountId: string) => {
    try {
      await updateAccount(accountId, { isArchived: true });
      console.log('Account archived:', accountId);
    } catch (err) {
      console.error('Error archiving account:', err);
      throw err instanceof Error ? err : new Error('Failed to archive account');
    }
  };

  const getTotalBalance = () => {
    return accounts.reduce((total, account) => {
      return total + account.balance;
    }, 0);
  };

  return {
    accounts,
    loading,
    error,
    addAccount,
    updateAccount,
    archiveAccount,
    getTotalBalance,
    refreshAccounts: fetchAccounts,
  };
} 