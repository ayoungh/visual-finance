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
  updateEdges: (edges: Edge[]) => void;
  setCurrency: (currency: string) => void;
}

let nodeId = 3;

const GROUPS = ['Housing', 'Utilities', 'Subscriptions'];

const calculateInitialPosition = (type: string, group?: string, label?: string): XYPosition => {
  // Base positions for each section
  const incomeX = 150;
  const expenseX = 600;
  const verticalSpacing = 120; // Increased vertical spacing between nodes
  const horizontalGroupSpacing = 200; // Increased horizontal spacing between groups
  const baseY = 50; // Start higher to make room for more nodes
  
  if (type === 'income') {
    return {
      x: incomeX,
      y: baseY + (nodeId * verticalSpacing) // Evenly space income nodes vertically
    };
  } else if (type === 'balance') {
    return {
      x: 400, // Center the balance node horizontally
      y: 600 // Fixed position at the bottom
    };
  } else { // expenses
    const groupIndex = GROUPS.indexOf(group || '');
    if (groupIndex !== -1) {
      // Calculate the number of items in this group to space them evenly
      const itemsInGroup = initialExpenses.filter(e => e.group === group).length;
      const groupItemIndex = initialExpenses.filter(e => e.group === group).findIndex(e => e.label === label);
      
      return {
        x: expenseX + (groupIndex * horizontalGroupSpacing),
        y: baseY + (groupItemIndex * verticalSpacing) // Evenly space items within groups
      };
    }
    // For ungrouped expenses
    return {
      x: expenseX,
      y: baseY + (nodeId * verticalSpacing)
    };
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

const initialNodes: Node[] = [
  {
    id: 'balance',
    type: 'balanceNode',
    position: calculateInitialPosition('balance'),
    data: { label: 'Current Balance', amount: initialBalance },
  },
  {
    id: 'income-0',
    type: 'financeNode',
    position: calculateInitialPosition('income'),
    data: { label: 'Monthly Salary', amount: initialIncome, type: 'income' },
  },
  ...initialExpenses.map((expense, index) => ({
    id: `expense-${index + 1}`,
    type: 'financeNode',
    position: calculateInitialPosition('expense', expense.group, expense.label),
    data: { 
      label: expense.label, 
      amount: expense.amount, 
      type: 'expense',
      group: expense.group 
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

export const useFinanceStore = create<FinanceState>((set) => ({
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
    const newNode: Node = {
      id: `${type}-${nodeId++}`,
      type: 'financeNode',
      position: calculateInitialPosition(type, group, label),
      data: { label, amount, type, group },
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

      // Update nodes including balance
      const updatedNodes = [...state.nodes, newNode].map(node => 
        node.id === 'balance' 
          ? { ...node, data: { ...node.data, amount: newBalance } }
          : node
      );

      // Ensure no duplicate edges
      const existingEdgeIndex = state.edges.findIndex(edge => edge.source === newNode.id);
      const updatedEdges = existingEdgeIndex >= 0
        ? state.edges.map((edge, index) => index === existingEdgeIndex ? newEdge : edge)
        : [...state.edges, newEdge];

      return {
        nodes: updatedNodes,
        edges: updatedEdges,
        balance: newBalance,
      };
    });
  },

  removeNode: (id) => {
    set((state) => {
      const nodeToRemove = state.nodes.find((node) => node.id === id);
      if (!nodeToRemove || nodeToRemove.id === 'balance') return state;

      const amount = nodeToRemove.data.amount;
      const type = nodeToRemove.data.type;
      
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