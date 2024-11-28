import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2, ArrowUpCircle, ArrowDownCircle, Tag, Pencil } from 'lucide-react';
import { useFinanceStore } from '@/store/financeStore';
import { formatCurrency } from '@/utils/currency';
import AddFinanceForm from './AddFinanceForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FinanceNodeProps {
  id: string;
  data: {
    label: string;
    amount: number;
    type: 'income' | 'expense';
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

  const handleDelete = () => {
    removeNode(id);
  };

  const editTrigger = (
    <button
      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
      title="Edit transaction"
    >
      <Pencil className="w-4 h-4 text-gray-500" />
    </button>
  );

  return (
    <div className={`px-4 py-2 shadow-lg rounded-lg border-2 cursor-move hover:shadow-xl transition-shadow ${
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
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="Delete transaction"
              >
                <Trash2 className="w-4 h-4 text-gray-500" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this {data.type} transaction of {currency}{data.amount.toFixed(2)}?
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AddFinanceForm
            editNode={{
              id,
              type: data.type,
              amount: data.amount,
              label: data.label,
              group: data.group,
            }}
            trigger={editTrigger}
          />
        </div>
      </div>
    </div>
  );
});