import { create } from 'zustand';
import { Node, Edge, XYPosition } from 'reactflow';
import { persist } from 'zustand/middleware';

interface BalanceNodeData {
  label: string;
  amount: number;
  type: 'balance';
}

interface FinanceNode extends Node {
  data: {
    label: string;
    amount: number;
    type: 'income' | 'expense';
    group?: string;
  };
}

interface BalanceNode extends Node {
  data: BalanceNodeData;
}

type NodeType = 'income' | 'expense' | 'balance';

interface FinanceState {
  nodes: (FinanceNode | BalanceNode)[];
  edges: Edge[];
  balance: number;
  currency: string;
  addNode: (type: 'income' | 'expense', amount: number, label: string, group?: string) => void;
  updateNode: (id: string, type: 'income' | 'expense', amount: number, label: string, group?: string) => void;
  removeNode: (id: string) => void;
  updateNodeAmount: (id: string, amount: number) => void;
  updateNodePosition: (id: string, position: XYPosition) => void;
  updateEdges: (edges: Edge[]) => void;
  setCurrency: (currency: string) => void;
}

let nodeId = 3;

const GROUPS = ['Housing', 'Utilities', 'Subscriptions'];

const calculateInitialPosition = (type: NodeType, group?: string, label?: string): XYPosition => {
  // Base positions for each section
  const incomeX = 150;
  const expenseX = 600;
  const balanceX = 350;
  
  let y = 200;  // Default Y position
  
  switch (type) {
    case 'income':
      return { x: incomeX, y };
    case 'expense':
      // Adjust Y position based on group
      if (group) {
        const groupIndex = GROUPS.indexOf(group);
        if (groupIndex !== -1) {
          y += groupIndex * 100;
        }
      }
      return { x: expenseX, y };
    case 'balance':
    default:
      return { x: balanceX, y };
  }
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

const initialNodes: (FinanceNode | BalanceNode)[] = [
  {
    id: 'balance',
    type: 'balanceNode',
    position: calculateInitialPosition('balance'),
    data: {
      label: 'Balance',
      amount: initialBalance,
      type: 'balance',
    },
  },
  {
    id: 'income-0',
    type: 'financeNode',
    position: calculateInitialPosition('income'),
    data: {
      type: 'income',
      label: 'Initial Income',
      amount: initialIncome,
    },
  },
  ...initialExpenses.map((expense, index) => ({
    id: `expense-${index + 1}`,
    type: 'financeNode',
    position: calculateInitialPosition('expense', expense.group, expense.label),
    data: {
      type: 'expense',
      label: expense.label,
      amount: expense.amount,
      group: expense.group,
    },
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

const createNode = (id: string, type: 'income' | 'expense', amount: number, label: string, group?: string): FinanceNode => {
  return {
    id,
    type: 'financeNode',
    position: calculateInitialPosition(type, group, label),
    data: { label, amount, type, group },
  };
};

const addEdges = (nodes: (FinanceNode | BalanceNode)[]): Edge[] => {
  return nodes.filter(node => node.id !== 'balance').map(node => ({
    id: `e-${node.id}`,
    source: node.id,
    target: 'balance',
    animated: true,
    style: { stroke: (node as FinanceNode).data.type === 'income' ? '#22c55e' : '#ef4444', strokeWidth: 2 },
  }));
};

const calculateBalance = (nodes: (FinanceNode | BalanceNode)[]): number => {
  const income = nodes.filter(node => (node as FinanceNode).data.type === 'income').reduce((sum, node) => sum + (node as FinanceNode).data.amount, 0);
  const expenses = nodes.filter(node => (node as FinanceNode).data.type === 'expense').reduce((sum, node) => sum + (node as FinanceNode).data.amount, 0);
  return income - expenses;
};

export const useFinanceStore = create(
  persist<FinanceState>(
    (set) => ({
      nodes: initialNodes,
      edges: initialEdges,
      balance: initialBalance,
      currency: 'GBP',

      setCurrency: (currency) => set({ currency }),
      
      updateEdges: (edges) => {
        set((state) => ({
          ...state,
          edges: edges.map(edge => ({
            ...edge,
            animated: true,
            style: { 
              stroke: edge.source.includes('income') ? '#22c55e' : '#ef4444',
              strokeWidth: 2 
            }
          }))
        }));
      },

      addNode: (type, amount, label, group) => {
        const id = `node-${nodeId++}`;
        const newNode = createNode(id, type, amount, label, group);
        set((state) => {
          const newNodes = [...state.nodes, newNode];
          return {
            nodes: newNodes,
            edges: addEdges(newNodes),
            balance: calculateBalance(newNodes),
          };
        });
      },

      updateNode: (id, type, amount, label, group) => {
        set((state) => {
          const nodeIndex = state.nodes.findIndex((node) => node.id === id);
          if (nodeIndex === -1) return state;

          const updatedNodes = [...state.nodes];
          updatedNodes[nodeIndex] = {
            ...updatedNodes[nodeIndex],
            data: {
              ...updatedNodes[nodeIndex].data,
              type,
              amount,
              label,
              group,
            },
          };

          return {
            nodes: updatedNodes,
            edges: addEdges(updatedNodes),
            balance: calculateBalance(updatedNodes),
          };
        });
      },

      removeNode: (id) => {
        set((state) => {
          const nodeToRemove = state.nodes.find((node) => node.id === id);
          if (!nodeToRemove || nodeToRemove.id === 'balance') return state;

          const amount = (nodeToRemove as FinanceNode).data.amount;
          const type = (nodeToRemove as FinanceNode).data.type;
          
          const newBalance = type === 'income' 
            ? state.balance - amount 
            : state.balance + amount;

          // Remove node and its associated edge
          const updatedNodes = state.nodes
            .filter((node) => node.id !== id)
            .map(node => 
              node.id === 'balance' 
                ? { ...node, data: { ...node.data, amount: newBalance } }
                : node
            );

          const updatedEdges = state.edges.filter(
            (edge) => edge.source !== id
          );

          return {
            nodes: updatedNodes,
            edges: updatedEdges,
            balance: newBalance,
          };
        });
      },

      updateNodeAmount: (id, amount) => {
        set((state) => {
          const node = state.nodes.find((n) => n.id === id);
          if (!node || node.id === 'balance') return state;

          const oldAmount = (node as FinanceNode).data.amount;
          const type = (node as FinanceNode).data.type;
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
    }),
    {
      name: 'visual-finance-storage',
      skipHydration: true, // Skip initial hydration to prevent React Flow issues
    }
  )
);