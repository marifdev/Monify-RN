import { useCallback, useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp, doc, updateDoc, runTransaction, where, deleteDoc, limit, DocumentData, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuthStore, useRefreshStore } from '../store';
import { Transaction, TransactionType, TransactionCategory } from '../types';

interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  type?: TransactionType;
  category?: TransactionCategory;
  accountId?: string;
  minAmount?: number;
  maxAmount?: number;
  searchText?: string;
}

interface TransactionStats {
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  categoryTotals: Record<TransactionCategory, number>;
  monthlyTotals: Record<string, { income: number; expense: number }>;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<TransactionFilters>({});
  const user = useAuthStore((state) => state.user);
  const refreshTrigger = useRefreshStore((state) => state.refreshTrigger);
  const refreshData = useRefreshStore((state) => state.refreshData);
  const [stats, setStats] = useState<TransactionStats>({
    totalIncome: 0,
    totalExpense: 0,
    netIncome: 0,
    categoryTotals: {} as Record<TransactionCategory, number>,
    monthlyTotals: {},
  });

  // Validate transaction data
  const validateTransaction = async (
    transaction: Transaction,
    accountDoc?: DocumentData,
    fromAccountDoc?: DocumentData,
  ) => {
    if (transaction.amount <= 0) {
      throw new Error('Transaction amount must be greater than 0');
    }

    if (transaction.type === 'expense') {
      const balance = accountDoc?.data()?.balance || 0;
      if (balance < transaction.amount) {
        throw new Error('Insufficient balance for this transaction');
      }
    }

    if (transaction.type === 'transfer') {
      if (!transaction.fromAccountId || !transaction.toAccountId) {
        throw new Error('Transfer requires both source and destination accounts');
      }
      if (transaction.fromAccountId === transaction.toAccountId) {
        throw new Error('Cannot transfer to the same account');
      }
      const balance = fromAccountDoc?.data()?.balance || 0;
      if (balance < transaction.amount) {
        throw new Error('Insufficient balance for transfer');
      }
    }
  };

  const fetchTransactions = async () => {
    try {
      if (!user) throw new Error('User not authenticated');

      setLoading(true);
      setError('');

      const transactionsCollectionRef = collection(db, `users/${user.id}/transactions`);
      const q = query(transactionsCollectionRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);

      const fetchedTransactions: Transaction[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedTransactions.push({
          id: doc.id,
          ...data,
          date: data.date.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Transaction);
      });

      setTransactions(fetchedTransactions);
      applyFilters(fetchedTransactions);
      calculateStats(fetchedTransactions);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback((transactionsToFilter: Transaction[]) => {
    let filtered = [...transactionsToFilter];

    if (filters.startDate) {
      filtered = filtered.filter(t => t.date >= filters.startDate!);
    }
    if (filters.endDate) {
      filtered = filtered.filter(t => t.date <= filters.endDate!);
    }
    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }
    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }
    if (filters.accountId) {
      filtered = filtered.filter(t =>
        t.accountId === filters.accountId ||
        t.fromAccountId === filters.accountId ||
        t.toAccountId === filters.accountId
      );
    }
    if (filters.minAmount) {
      filtered = filtered.filter(t => t.amount >= filters.minAmount!);
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(t => t.amount <= filters.maxAmount!);
    }
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchLower) ||
        t.notes?.toLowerCase().includes(searchLower) ||
        t.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    setFilteredTransactions(filtered);
  }, [filters]);

  const calculateStats = useCallback((transactionsToCalculate: Transaction[]) => {
    const newStats: TransactionStats = {
      totalIncome: 0,
      totalExpense: 0,
      netIncome: 0,
      categoryTotals: {} as Record<TransactionCategory, number>,
      monthlyTotals: {},
    };

    transactionsToCalculate.forEach(transaction => {
      // Calculate totals
      if (transaction.type === 'income') {
        newStats.totalIncome += transaction.amount;
      } else if (transaction.type === 'expense') {
        newStats.totalExpense += transaction.amount;
      }

      // Calculate category totals
      if (!newStats.categoryTotals[transaction.category]) {
        newStats.categoryTotals[transaction.category] = 0;
      }
      newStats.categoryTotals[transaction.category] += transaction.amount;

      // Calculate monthly totals
      const monthKey = transaction.date.toISOString().slice(0, 7); // YYYY-MM
      if (!newStats.monthlyTotals[monthKey]) {
        newStats.monthlyTotals[monthKey] = { income: 0, expense: 0 };
      }
      if (transaction.type === 'income') {
        newStats.monthlyTotals[monthKey].income += transaction.amount;
      } else if (transaction.type === 'expense') {
        newStats.monthlyTotals[monthKey].expense += transaction.amount;
      }
    });

    newStats.netIncome = newStats.totalIncome - newStats.totalExpense;
    setStats(newStats);
  }, []);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    } else {
      setTransactions([]);
      setFilteredTransactions([]);
    }
  }, [user, refreshTrigger]);

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!user) throw new Error('User not authenticated');

      await runTransaction(db, async (transaction) => {
        // Get account documents for validation
        let accountDoc, fromAccountDoc, toAccountDoc;

        if (transactionData.type === 'transfer') {
          if (!transactionData.fromAccountId || !transactionData.toAccountId) {
            throw new Error('Transfer requires both source and destination accounts');
          }
          const fromAccountRef = doc(db, 'users', user.id, 'accounts', transactionData.fromAccountId as string);
          const toAccountRef = doc(db, 'users', user.id, 'accounts', transactionData.toAccountId as string);
          fromAccountDoc = await transaction.get(fromAccountRef);
          toAccountDoc = await transaction.get(toAccountRef);
        } else {
          if (!transactionData.accountId) {
            throw new Error('Transaction requires an account');
          }
          const accountRef = doc(db, 'users', user.id, 'accounts', transactionData.accountId as string);
          accountDoc = await transaction.get(accountRef);
        }

        // Validate the transaction
        await validateTransaction(
          transactionData as Transaction,
          accountDoc,
          fromAccountDoc
        );

        // Create the transaction document data
        const newTransaction = {
          ...transactionData,
          userId: user.id,
          status: 'completed' as const,
          date: Timestamp.fromDate(transactionData.date),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        // Add the transaction document
        const transactionDocRef = await addDoc(
          collection(db, 'users', user.id, 'transactions'),
          newTransaction
        );

        // Update account balances based on transaction type
        if (transactionData.type === 'transfer') {
          const fromAccountRef = doc(db, 'users', user.id, 'accounts', transactionData.fromAccountId as string);
          const toAccountRef = doc(db, 'users', user.id, 'accounts', transactionData.toAccountId as string);

          // Subtract from source account
          transaction.update(fromAccountRef, {
            balance: fromAccountDoc!.data()!.balance - transactionData.amount,
            updatedAt: serverTimestamp(),
          });

          // Add to destination account
          transaction.update(toAccountRef, {
            balance: toAccountDoc!.data()!.balance + transactionData.amount,
            updatedAt: serverTimestamp(),
          });
        } else {
          const accountRef = doc(db, 'users', user.id, 'accounts', transactionData.accountId as string);
          const currentBalance = accountDoc!.data()!.balance;
          const newBalance = transactionData.type === 'income'
            ? currentBalance + transactionData.amount
            : currentBalance - transactionData.amount;

          transaction.update(accountRef, {
            balance: newBalance,
            updatedAt: serverTimestamp(),
          });
        }

        return transactionDocRef.id;
      });

      refreshData();
    } catch (err) {
      console.error('Error adding transaction:', err);
      throw err instanceof Error ? err : new Error('Failed to add transaction');
    }
  };

  const deleteTransaction = async (transactionId: string) => {
    try {
      if (!user) throw new Error('User not authenticated');

      await runTransaction(db, async (transaction) => {
        // Get the transaction document
        const transactionRef = doc(db, `users/${user.id}/transactions`, transactionId);
        const transactionDoc = await transaction.get(transactionRef);

        if (!transactionDoc.exists()) {
          throw new Error('Transaction not found');
        }

        const transactionData = transactionDoc.data() as Transaction;

        // Reverse the account balance changes
        if (transactionData.type === 'transfer') {
          const fromAccountRef = doc(db, `users/${user.id}/accounts`, transactionData.fromAccountId as string);
          const toAccountRef = doc(db, `users/${user.id}/accounts`, transactionData.toAccountId as string);

          const fromAccountDoc = await transaction.get(fromAccountRef);
          const toAccountDoc = await transaction.get(toAccountRef);

          if (!fromAccountDoc.exists() || !toAccountDoc.exists()) {
            throw new Error('One or both accounts not found');
          }

          // Add back to source account
          transaction.update(fromAccountRef, {
            balance: fromAccountDoc.data()!.balance + transactionData.amount,
            updatedAt: serverTimestamp(),
          });

          // Subtract from destination account
          transaction.update(toAccountRef, {
            balance: toAccountDoc.data()!.balance - transactionData.amount,
            updatedAt: serverTimestamp(),
          });
        } else {
          const accountRef = doc(db, `users/${user.id}/accounts`, transactionData.accountId as string);
          const accountDoc = await transaction.get(accountRef);

          if (!accountDoc.exists()) {
            throw new Error('Account not found');
          }

          const currentBalance = accountDoc.data()!.balance;
          const newBalance = transactionData.type === 'income'
            ? currentBalance - transactionData.amount
            : currentBalance + transactionData.amount;

          transaction.update(accountRef, {
            balance: newBalance,
            updatedAt: serverTimestamp(),
          });
        }

        // Delete the transaction document
        await deleteDoc(transactionRef);
      });

      refreshData();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      throw err instanceof Error ? err : new Error('Failed to delete transaction');
    }
  };

  return {
    transactions: filteredTransactions,
    allTransactions: transactions,
    loading,
    error,
    stats,
    filters,
    setFilters,
    addTransaction,
    deleteTransaction,
    refreshTransactions: refreshData,
  };
} 