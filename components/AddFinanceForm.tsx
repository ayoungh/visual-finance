import React from 'react';
import { PlusCircle, Loader2, Pencil } from 'lucide-react';
import { useFinanceStore } from '../store/financeStore';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from './ui/sheet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

const GROUPS = ['Housing', 'Utilities', 'Subscriptions', 'Transportation', 'Food', 'Entertainment'];

const formSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be a positive number',
  }),
  label: z.string().min(1, 'Description is required').max(50, 'Description is too long'),
  group: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddFinanceFormProps {
  editNode?: {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    label: string;
    group?: string;
  };
  trigger?: React.ReactNode;
}

export default function AddFinanceForm({ editNode, trigger }: AddFinanceFormProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const addNode = useFinanceStore((state) => state.addNode);
  const updateNode = useFinanceStore((state) => state.updateNode);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: editNode?.type || 'income',
      amount: editNode ? String(editNode.amount) : '',
      label: editNode?.label || '',
      group: editNode?.group || 'none',
    },
  });

  const type = watch('type');

  React.useEffect(() => {
    if (open && editNode) {
      setValue('type', editNode.type);
      setValue('amount', String(editNode.amount));
      setValue('label', editNode.label);
      setValue('group', editNode.group || 'none');
    }
  }, [open, editNode, setValue]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
      if (editNode) {
        updateNode(
          editNode.id,
          data.type,
          parseFloat(data.amount),
          data.label,
          data.group === 'none' ? undefined : data.group
        );
      } else {
        addNode(
          data.type,
          parseFloat(data.amount),
          data.label,
          data.group === 'none' ? undefined : data.group
        );
      }
      reset();
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultTrigger = (
    <Button
      size="lg"
      className="fixed bottom-6 right-6 z-50 gap-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 bg-blue-600 hover:bg-blue-700 text-white"
    >
      <PlusCircle className="w-5 h-5" />
      Add Transaction
    </Button>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{editNode ? 'Edit Transaction' : 'Add New Transaction'}</SheetTitle>
          <SheetDescription>
            {editNode ? 'Update the transaction details below.' : 'Add a new income or expense to your financial flow.'}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={type}
              onValueChange={(value) => setValue('type', value as 'income' | 'expense')}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <Input
                {...register('amount')}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className={cn(
                  'pr-10',
                  errors.amount && 'border-red-500 focus-visible:ring-red-500'
                )}
              />
              <span className="absolute right-3 top-2 text-gray-400">$</span>
            </div>
            <AnimatePresence>
              {errors.amount && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm text-red-500 mt-1"
                >
                  {errors.amount.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              {...register('label')}
              type="text"
              placeholder="Enter description"
              className={cn(
                errors.label && 'border-red-500 focus-visible:ring-red-500'
              )}
            />
            <AnimatePresence>
              {errors.label && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm text-red-500 mt-1"
                >
                  {errors.label.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {type === 'expense' && (
            <div className="space-y-2">
              <Label htmlFor="group">Group</Label>
              <Select
                value={watch('group')}
                onValueChange={(value) => setValue('group', value)}
              >
                <SelectTrigger id="group">
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Group</SelectItem>
                  {GROUPS.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {editNode ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              <>
                {editNode ? <Pencil className="w-4 h-4 mr-2" /> : <PlusCircle className="w-4 h-4 mr-2" />}
                {editNode ? 'Update Transaction' : 'Add Transaction'}
              </>
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}