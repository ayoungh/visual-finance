"use client";

import React, { useCallback, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  NodeChange,
  Edge,
  Connection,
  EdgeChange,
  applyEdgeChanges,
  applyNodeChanges,
} from "reactflow";
import "reactflow/dist/style.css";
import { useFinanceStore } from "@/store/financeStore";
import FinanceNode from "@/components/FinanceNode";
import BalanceNode from "@/components/BalanceNode";
import AddFinanceForm from "@/components/AddFinanceForm";
import CurrencySelector from "@/components/CurrencySelector";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const nodeTypes = {
  financeNode: FinanceNode,
  balanceNode: BalanceNode,
};

function App() {
  const { nodes, edges, updateNodePosition, updateEdges, balance } = useFinanceStore();

  // Hydrate the store after mount
  useEffect(() => {
    const savedState = localStorage.getItem('visual-finance-storage');
    if (savedState) {
      try {
        const { state } = JSON.parse(savedState);
        useFinanceStore.setState(state);
      } catch (error) {
        console.error('Failed to hydrate store:', error);
      }
    }
  }, []);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((change) => {
        if (change.type === "position" && change.position) {
          updateNodePosition(change.id, change.position);
        }
      });
    },
    [updateNodePosition]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const updatedEdges = applyEdgeChanges(changes, edges);
      updateEdges(updatedEdges);
    },
    [edges, updateEdges]
  );

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="border-b bg-white p-4 shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Visual Finance
          </h1>
          <CurrencySelector />
        </div>
      </div>

      <div className="flex-1">
        <AnimatePresence>
          {balance < 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
            >
              <Alert variant="warning" className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-1" />
                <div>
                  <AlertTitle>Negative Balance Warning</AlertTitle>
                  <AlertDescription>
                    Your current balance is negative (${balance.toFixed(2)}). This financial situation may not be sustainable in the long term. Consider reducing expenses or increasing income to achieve a positive balance.
                  </AlertDescription>
                </div>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
        
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
          minZoom={0.2}
          maxZoom={1.5}
          fitViewOptions={{
            padding: 0.2,
            includeHiddenNodes: true,
          }}
          className="bg-gray-50"
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      
      <AddFinanceForm />
    </div>
  );
}

export default App;
