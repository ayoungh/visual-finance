import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useKeyPress,
  ReactFlowProvider,
  Panel,
} from "reactflow";
// 👇 you need to import the reactflow styles
import "reactflow/dist/style.css";

import { Pane } from "tweakpane";
import incomeNode from "../components/incomeNode";
import expenseNode from "../components/expenseNode";
import DataPanel from "../components/dataPanel";

const Home: NextPage = () => {
  const nodeTypes = {
    incomeNode,
    expenseNode,
  };

  // state
  const [nodeName, setNodeName] = useState("£700");

  const initialNodes = [
    // income
    {
      id: "1",
      position: { x: 100, y: 100 },
      type: "incomeNode",
      data: { label: "Income", amount: "£2000", type: "income" },
      sourcePosition: "right",
      draggable: false,
    },
    // subscriptions group
    // {
    //   id: "G",
    //   type: "group",
    //   data: { label: null },
    //   position: { x: 300, y: 100 },
    //   style: {
    //     width: 300,
    //     height: 600,
    //   },
    // },
    // subscriptions
    {
      id: "2",
      position: { x: 500, y: 200 },
      type: "expenseNode",
      data: { label: "Tax", amount: "£100" },
      sourcePosition: "right",
      targetPosition: "left",
      // parentNode: "G",
      // extent: "parent",
    },
    {
      id: "3",
      position: { x: 500, y: 300 },
      type: "expenseNode",
      data: { label: "Rent", amount: "£800" },
      sourcePosition: "right",
      targetPosition: "left",
      // parentNode: "G",
      // extent: "parent",
    },
    {
      id: "4",
      position: { x: 500, y: 400 },
      type: "expenseNode",
      data: { label: "Electric", amount: "£100" },
      sourcePosition: "right",
      targetPosition: "left",
      // parentNode: "G",
      // extent: "parent",
    },
    {
      id: "5",
      position: { x: 500, y: 500 },
      type: "expenseNode",
      data: { label: "Amazon Prime", amount: "£7.99" },
      sourcePosition: "right",
      targetPosition: "left",
      // parentNode: "G",
      // extent: "parent",
    },
    // Outstanding Balance
    {
      id: "O",
      position: { x: 800, y: 700 },
      type: "expenseNode",
      data: { label: "Outstandng", amount: "£7.99" },
      sourcePosition: "right",
      targetPosition: "left",
    },
  ];

  const initialEdges = [
    { id: "e1-2", source: "1", target: "2", type: "smoothstep" },
    { id: "e1-3", source: "1", target: "3", type: "smoothstep" },
    { id: "e1-4", source: "1", target: "4", type: "smoothstep" },
    { id: "e1-4", source: "1", target: "5", type: "smoothstep" },
    { id: "e1-g1", source: "1", target: "2", type: "smoothstep" },
    { id: "g1-e1", source: "G", target: "O", type: "smoothstep" },
  ];

  const snapGrid = [20, 20];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const spacePressed = useKeyPress("Space");

  useEffect(() => {
    const pane = new Pane();
    const PARAMS = {
      factor: 123,
      Income: "700",
      color: "#ff0055",
    };
    pane.addInput(PARAMS, "Income").on("change", (ev) => {
      setNodeName(`£${ev.value}`);
      console.log(ev.value);
      if (ev.last) {
        console.log("(last)");
      }
    });

    return () => {};
  }, []);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === "1") {
          // it's important that you create a new object here
          // in order to notify react flow about the change
          node.data = {
            ...node.data,
            amount: nodeName,
          };
        }

        if (node.id === "O") {
          node.data = {
            ...node.data,
            amount: nodeName+'o',
          };
        }

        return node;
      })
    );
  }, [nodeName, setNodes]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const proOptions = { hideAttribution: true, account: "" };

  return (
    <div className={styles.container}>
      <Head>
        <title>VisualFinance</title>
        <meta name="description" content="A visual view on your finances" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>VisualFinance</h1>
        <ReactFlowProvider>
          {nodeName}
          {/* @ts-ignore */}
          {/* <button
          onClick={() => {
            setNodes([
              ...nodes,
              {
                id: `${nodes.length + 1}`,
                position: { x: 0, y: Number(`${nodes.length + 1}00`) },
                data: { label: `${nodes.length + 1}` },
              },
            ]);
            console.log(nodes);
            setEdges([
              ...edges,
              {
                id: `${edges.length + 1}`,
                source: `${edges.length}`,
                target: `${edges.length + 1}`,
              },
            ]);
            console.log(edges);
          }}
        >
          ADD A NODE
        </button> */}

          {/* <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h2>Documentation &rarr;</h2>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>
        </div> */}

          <div style={{ width: "100%", height: "100vh" }}>
            <ReactFlow
              panOnScroll
              panOnDrag={spacePressed}
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              proOptions={proOptions}
              snapToGrid
              snapGrid={snapGrid}
              nodeTypes={nodeTypes}
              // fitView
            >
              {/* <MiniMap /> */}
              <Controls />
              <Background />
              <Panel position="bottom-right" children={<div>a test</div>} />
            </ReactFlow>
          </div>

          <DataPanel nodes={nodes} setNodes={setNodes} />
        </ReactFlowProvider>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
};

export default Home;
