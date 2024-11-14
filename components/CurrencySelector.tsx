import React from 'react';
import { useFinanceStore } from '@/store/financeStore';
import { CURRENCIES } from '@/utils/currency';

export default function CurrencySelector() {
  const { currency, setCurrency } = useFinanceStore();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        {Object.entries(CURRENCIES).map(([code, { name }]) => (
          <option key={code} value={code}>
            {code} - {name}
          </option>
        ))}
      </select>
    </div>
  );
}