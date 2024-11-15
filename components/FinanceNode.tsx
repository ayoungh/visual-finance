import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2, ArrowUpCircle, ArrowDownCircle, GripHorizontal, Tag } from 'lucide-react';
import { useFinanceStore } from '@/store/financeStore';
import { formatCurrency } from '@/utils/currency';

interface FinanceNodeProps {
  id: string;
  data: {
    label: string;
    amount: number;
    type: string;
    group?: string;
  };
}

export default memo(function FinanceNode({ id, data }: FinanceNodeProps) {
  const removeNode = useFinanceStore((state) => state.removeNode);
  const updateNodeAmount = useFinanceStore((state) => state.updateNodeAmount);
  const currency = useFinanceStore((state) => state.currency);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = parseFloat(e.target.value) || 0;
    updateNodeAmount(id, newAmount);
  };

  return (
    <div className={`px-4 py-2 shadow-lg rounded-lg border-2 ${
      data.type === 'income' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
    }`}>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3" 
        style={{ 
          background: data.type === 'income' ? '#22c55e' : '#ef4444',
          border: 'none'
        }} 
      />
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {data.type === 'income' ? (
            <ArrowUpCircle className="w-5 h-5 text-green-600" />
          ) : (
            <ArrowDownCircle className="w-5 h-5 text-red-600" />
          )}
          <span className="font-medium text-gray-700">{data.label}</span>
        </div>
        <div className="drag-handle cursor-move">
          <GripHorizontal className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {data.group && (
        <div className="flex items-center gap-1 mb-2">
          <Tag className="w-3 h-3 text-gray-500" />
          <span className="text-sm text-gray-500">{data.group}</span>
        </div>
      )}

      <div className="mt-2 flex items-center gap-2">
        <div className="flex items-center bg-white rounded-md border px-2">
          <span className="text-gray-500">{formatCurrency(0, currency).charAt(0)}</span>
          <input
            type="number"
            value={data.amount}
            onChange={handleAmountChange}
            className="w-20 py-1 focus:outline-none"
          />
        </div>
        <button
          onClick={() => removeNode(id)}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Trash2 className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
});