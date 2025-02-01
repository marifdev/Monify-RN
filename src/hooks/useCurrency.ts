import { useAppStore } from '../store';
import { formatCurrency } from '../utils/currency';

export function useCurrency() {
  const { currency } = useAppStore();

  const format = (amount: number) => {
    return formatCurrency(amount, currency);
  };

  return {
    format,
    currencyCode: currency,
  };
} 