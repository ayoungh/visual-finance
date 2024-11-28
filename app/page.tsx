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

const nodeTypes = {
  financeNode: FinanceNode,
  balanceNode: BalanceNode,
};

function App() {
  const { nodes, edges, updateNodePosition, updateEdges } = useFinanceStore();

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
