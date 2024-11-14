"use client";

import React, { useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  OnNodesChange,
  NodeChange,
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
  const { nodes, edges, updateNodePosition } = useFinanceStore();

  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((change) => {
        if (change.type === "position" && change.position) {
          updateNodePosition(change.id, change.position);
        }
      });
    },
    [updateNodePosition]
  );

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="border-b bg-white p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Financial Flow Dashboard
          </h1>
          <CurrencySelector />
        </div>
        <AddFinanceForm />
      </div>

      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          fitView
          className="bg-gray-50"
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

export default App;
