import { create } from 'zustand';
import { Node, Edge, XYPosition } from 'reactflow';

interface FinanceState {
  nodes: Node[];
  edges: Edge[];
  balance: number;
  currency: string;
  addNode: (type: string, amount: number, label: string, group?: string) => void;
  removeNode: (id: string) => void;
  updateNodeAmount: (id: string, amount: number) => void;
  updateNodePosition: (id: string, position: XYPosition) => void;
  setCurrency: (currency: string) => void;
}

let nodeId = 3;

const calculateInitialPosition = (type: string, group?: string): XYPosition => {
  const baseX = type === 'income' ? 200 : 600;
  const baseY = 100;
  
  if (group) {
    return {
      x: baseX + (Math.random() * 100 - 50),
      y: baseY + (Math.random() * 100)
    };
  }
  
  return {
    x: baseX,
    y: baseY + Math.random() * 200
  };
};

const initialIncome = 5000;
const initialExpenses = [
  { label: 'Rent', amount: 1500, group: 'Housing' },
  { label: 'Electricity', amount: 100, group: 'Utilities' },
  { label: 'Water', amount: 50, group: 'Utilities' },
  { label: 'Netflix', amount: 15, group: 'Subscriptions' },
  { label: 'Spotify', amount: 10, group: 'Subscriptions' }
];

const initialBalance = initialIncome - initialExpenses.reduce((sum, exp) => sum + exp.amount, 0);

const initialNodes: Node[] = [
  {
    id: 'balance',
    type: 'balanceNode',
    position: { x: 400, y: 300 },
    data: { label: 'Current Balance', amount: initialBalance },
  },
  {
    id: 'income-0',
    type: 'financeNode',
    position: { x: 200, y: 100 },
    data: { label: 'Monthly Salary', amount: initialIncome, type: 'income' },
    dragHandle: '.drag-handle',
  },
  ...initialExpenses.map((expense, index) => ({
    id: `expense-${index + 1}`,
    type: 'financeNode',
    position: calculateInitialPosition('expense', expense.group),
    data: { 
      label: expense.label, 
      amount: expense.amount, 
      type: 'expense',
      group: expense.group 
    },
    dragHandle: '.drag-handle',
  })),
];

const initialEdges: Edge[] = [
  {
    id: 'e-income-0',
    source: 'income-0',
    target: 'balance',
    animated: true,
    style: { stroke: '#22c55e', strokeWidth: 2 },
  },
  ...initialExpenses.map((_, index) => ({
    id: `e-expense-${index + 1}`,
    source: `expense-${index + 1}`,
    target: 'balance',
    animated: true,
    style: { stroke: '#ef4444', strokeWidth: 2 },
  })),
];

export const useFinanceStore = create<FinanceState>((set) => ({
  nodes: initialNodes,
  edges: initialEdges,
  balance: initialBalance,
  currency: 'USD',

  setCurrency: (currency) => set({ currency }),

  addNode: (type, amount, label, group) => {
    const newNode: Node = {
      id: `${type}-${nodeId++}`,
      type: 'financeNode',
      position: calculateInitialPosition(type, group),
      data: { label, amount, type, group },
      dragHandle: '.drag-handle',
    };

    const newEdge: Edge = {
      id: `e-${newNode.id}`,
      source: newNode.id,
      target: 'balance',
      animated: true,
      style: { stroke: type === 'income' ? '#22c55e' : '#ef4444', strokeWidth: 2 },
    };

    set((state) => {
      const newBalance = type === 'income' 
        ? state.balance + amount 
        : state.balance - amount;

      const updatedNodes = [...state.nodes, newNode].map(node => 
        node.id === 'balance' 
          ? { ...node, data: { ...node.data, amount: newBalance } }
          : node
      );

      return {
        nodes: updatedNodes,
        edges: [...state.edges, newEdge],
        balance: newBalance,
      };
    });
  },

  removeNode: (id) => {
    set((state) => {
      const node = state.nodes.find((n) => n.id === id);
      if (!node || node.id === 'balance') return state;

      const amount = node.data.amount;
      const type = node.data.type;
      const newBalance = type === 'income' 
        ? state.balance - amount 
        : state.balance + amount;

      const updatedNodes = state.nodes
        .filter((n) => n.id !== id)
        .map(node => 
          node.id === 'balance' 
            ? { ...node, data: { ...node.data, amount: newBalance } }
            : node
        );

      return {
        nodes: updatedNodes,
        edges: state.edges.filter((e) => e.source !== id),
        balance: newBalance,
      };
    });
  },

  updateNodeAmount: (id, amount) => {
    set((state) => {
      const node = state.nodes.find((n) => n.id === id);
      if (!node || node.id === 'balance') return state;

      const oldAmount = node.data.amount;
      const type = node.data.type;
      const difference = amount - oldAmount;
      const newBalance = type === 'income' 
        ? state.balance + difference 
        : state.balance - difference;

      const updatedNodes = state.nodes.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, amount } };
        }
        if (node.id === 'balance') {
          return { ...node, data: { ...node.data, amount: newBalance } };
        }
        return node;
      });

      return {
        nodes: updatedNodes,
        balance: newBalance,
      };
    });
  },

  updateNodePosition: (id, position) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, position } : node
      ),
    }));
  },
}));