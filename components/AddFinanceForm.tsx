import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useFinanceStore } from '../store/financeStore';

const GROUPS = ['Housing', 'Utilities', 'Subscriptions', 'Transportation', 'Food', 'Entertainment'];

export default function AddFinanceForm() {
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');
  const [group, setGroup] = useState('');
  const addNode = useFinanceStore((state) => state.addNode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !label) return;

    addNode(type, parseFloat(amount), label, group || undefined);
    setAmount('');
    setLabel('');
    setGroup('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as 'income' | 'expense')}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Enter description"
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {type === 'expense' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">No Group</option>
            {GROUPS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      )}

      <button
        type="submit"
        className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        <PlusCircle className="w-4 h-4" />
        Add
      </button>
    </form>
  );
}