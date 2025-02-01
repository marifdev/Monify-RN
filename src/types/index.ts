import { z } from 'zod';

// Account Types
export const AccountTypeSchema = z.enum(['CASH', 'BANK', 'CREDIT_CARD', 'SAVINGS', 'INVESTMENT']);
export type AccountType = z.infer<typeof AccountTypeSchema>;

export const AccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: AccountTypeSchema,
  balance: z.number(),
  currency: z.string().default('USD'),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  icon: z.string().optional(),
  color: z.string().optional(),
  isArchived: z.boolean().default(false),
});

export type Account = z.infer<typeof AccountSchema>;

// Transaction Types
export const TransactionTypeSchema = z.enum(['income', 'expense', 'transfer']);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

export const TransactionCategorySchema = z.enum([
  'salary',
  'business',
  'investment',
  'food',
  'transportation',
  'housing',
  'utilities',
  'insurance',
  'healthcare',
  'entertainment',
  'shopping',
  'education',
  'savings',
  'debt',
  'other',
]);
export type TransactionCategory = z.infer<typeof TransactionCategorySchema>;

export const TransactionStatusSchema = z.enum(['completed', 'pending', 'failed', 'cancelled']);
export type TransactionStatus = z.infer<typeof TransactionStatusSchema>;

export const TransactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: TransactionTypeSchema,
  amount: z.number(),
  description: z.string(),
  date: z.date(),
  accountId: z.string().optional(),
  fromAccountId: z.string().optional(),
  toAccountId: z.string().optional(),
  category: TransactionCategorySchema,
  status: TransactionStatusSchema,
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
}).refine(
  (data) => {
    if (data.type === 'transfer') {
      return data.fromAccountId && data.toAccountId;
    }
    return data.accountId;
  },
  {
    message: "Transfer requires fromAccountId and toAccountId, other types require accountId",
  }
);

export type Transaction = z.infer<typeof TransactionSchema>;

// User Types
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  settings: z.object({
    currency: z.string().default('USD'),
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    notifications: z.boolean().default(true),
  }),
});

export type User = z.infer<typeof UserSchema>;

// Category Types
export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  type: z.enum(['income', 'expense']),
  color: z.string(),
  userId: z.string(),
});

export type Category = z.infer<typeof CategorySchema>;

// Transaction Categories Configuration
export const TRANSACTION_CATEGORIES: Record<TransactionCategory, { label: string; icon: string }> = {
  salary: { label: 'Salary', icon: 'cash-multiple' },
  business: { label: 'Business', icon: 'briefcase' },
  investment: { label: 'Investment', icon: 'chart-line' },
  food: { label: 'Food & Dining', icon: 'food' },
  transportation: { label: 'Transportation', icon: 'car' },
  housing: { label: 'Housing', icon: 'home' },
  utilities: { label: 'Utilities', icon: 'lightning-bolt' },
  insurance: { label: 'Insurance', icon: 'shield' },
  healthcare: { label: 'Healthcare', icon: 'medical-bag' },
  entertainment: { label: 'Entertainment', icon: 'movie' },
  shopping: { label: 'Shopping', icon: 'shopping' },
  education: { label: 'Education', icon: 'school' },
  savings: { label: 'Savings', icon: 'piggy-bank' },
  debt: { label: 'Debt', icon: 'credit-card' },
  other: { label: 'Other', icon: 'dots-horizontal' },
}; 