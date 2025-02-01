import { CURRENCIES, Currency } from '../constants';

export function formatCurrency(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback to basic formatting if the currency code is not supported
    const currencySymbol = CURRENCIES.find((c: Currency) => c.code === currencyCode)?.symbol || currencyCode;
    const formattedAmount = amount.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${currencySymbol}${formattedAmount}`;
  }
} 