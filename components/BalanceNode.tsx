import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Wallet } from 'lucide-react';
import { useFinanceStore } from '@/store/financeStore';
import { formatCurrency } from '@/utils/currency';

interface BalanceNodeProps {
  data: {
    label: string;
    amount: number;
  };
}

export default memo(function BalanceNode({ data }: BalanceNodeProps) {
  const currency = useFinanceStore((state) => state.currency);

  return (
    <div className="px-6 py-4 shadow-lg rounded-lg bg-blue-50 border-2 border-blue-200">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center gap-2 mb-2">
        <Wallet className="w-6 h-6 text-blue-600" />
        <span className="font-medium text-gray-700">{data.label}</span>
      </div>

      <div className="text-2xl font-bold text-blue-700">
        {formatCurrency(data.amount, currency)}
      </div>
    </div>
  );
});