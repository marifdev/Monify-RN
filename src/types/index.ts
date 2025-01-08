import { z } from 'zod';

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

export const TransactionSchema = z.object({
  id: z.string(),
  amount: z.number(),
  type: z.enum(['income', 'expense']),
  category: z.string(),
  description: z.string(),
  date: z.date(),
  userId: z.string(),
  accountId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

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

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  type: z.enum(['income', 'expense']),
  color: z.string(),
  userId: z.string(),
});

export type Category = z.infer<typeof CategorySchema>; 