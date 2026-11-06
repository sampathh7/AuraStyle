import { CurrencyCode, CurrencyConfig } from '../types';

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    rateFromUSD: 86,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rateFromUSD: 1,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    rateFromUSD: 0.92,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    rateFromUSD: 0.79,
  },
};

export function convertAmount(amount: number, from: CurrencyCode, to: CurrencyCode): number {
  if (from === to) return amount;
  const inUSD = amount / CURRENCIES[from].rateFromUSD;
  const result = inUSD * CURRENCIES[to].rateFromUSD;
  return to === 'INR' ? Math.round(result) : Number(result.toFixed(0));
}

export function formatPrice(amount: number, currency: CurrencyCode): string {
  const symbol = CURRENCIES[currency]?.symbol || '$';
  if (currency === 'INR') {
    return `${symbol}${amount.toLocaleString('en-IN')}`;
  }
  return `${symbol}${amount.toLocaleString('en-US')}`;
}
