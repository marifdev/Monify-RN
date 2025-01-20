import { useEffect, useState } from 'react';
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
import { Account } from '../types';
import { useAuthStore, useRefreshStore } from '../store';

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const refreshTrigger = useRefreshStore((state) => state.refreshTrigger);
  const refreshData = useRefreshStore((state) => state.refreshData);

  const fetchAccounts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const accountsCollectionRef = collection(db, `users/${user.id}/accounts`);
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

      setAccounts(accountsList);
      setError(null);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAccounts();
    } else {
      setAccounts([]);
    }
  }, [user, refreshTrigger]);

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
      refreshData();
      return docRef.id;
    } catch (err) {
      console.error('Error adding account:', err);
      throw err instanceof Error ? err : new Error('Failed to add account');
    }
  };

  const updateAccount = async (accountId: string, updates: Partial<Account>) => {
    try {
      const accountRef = doc(db, `users/${user!.id}/accounts`, accountId);
      await updateDoc(accountRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      refreshData();
    } catch (err) {
      console.error('Error updating account:', err);
      throw err instanceof Error ? err : new Error('Failed to update account');
    }
  };

  const archiveAccount = async (accountId: string) => {
    try {
      await updateAccount(accountId, { isArchived: true });
      console.log('Account archived:', accountId);
      refreshData();
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
    refreshAccounts: refreshData,
  };
} 