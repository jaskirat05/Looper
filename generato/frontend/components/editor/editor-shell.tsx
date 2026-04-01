"use client";

import Link from "next/link";
import {
  Background,
  ConnectionMode,
  Controls,
  MiniMap,
  Panel as FlowPanel,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import { useMemo } from "react";
import { nodeDefinitions } from "@/lib/node-definitions";
import { useCompileState, useGraphState } from "@/stores/editor-store";
import { SearchOverlay } from "./search-overlay";
import { WorkflowNode } from "./workflow-node";

const nodeTypes = {
  workflow: WorkflowNode,
};

function EditorCanvas() {
  const { nodes, edges, setNodes, setEdges, connect, openSearch, selectNode, compile } =
    useGraphState();
  const { compileResult } = useCompileState();
  const { screenToFlowPosition } = useReactFlow();

  const selectedNode = useMemo(
    () => nodes.find((node) => node.selected) ?? nodes[0],
    [nodes],
  );

  return (
    <div className="editor-page">
      <div className="editor-shell">
        <aside className="panel">
          <span className="panel-label">Flow controls</span>
          <h3>Modern DAG editor</h3>
          <div className="control-list">
            <div className="control-item">
              <strong>Double click to add</strong>
              <span>
                Open the node search anywhere on the canvas and insert a new block at that point.
              </span>
            </div>
            <div className="control-item">
              <strong>Fast state slices</strong>
              <span>Zustand selectors keep graph data, search state, and compile state isolated.</span>
            </div>
            <div className="control-item">
              <strong>Deterministic compiler</strong>
              <span>Generate an IR with topology, edges, nodes, and graph diagnostics.</span>
            </div>
          </div>

          <div className="inspector-grid">
            <div className="inspector-card">
              <p className="panel-label">Node library</p>
              <div className="toolbar-row">
                {nodeDefinitions.map((definition) => (
                  <div className="diagnostic-item" key={definition.type}>
                    <strong>{definition.label}</strong>
                    <span>{definition.kind}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <section className="canvas-panel">
          <div className="editor-toolbar">
            <div className="toolbar-cluster">
              <Link className="ghost-button" href="/">
                Back to landing
              </Link>
              <button className="compile-button" onClick={compile} type="button">
                Compile graph
              </button>
            </div>
          </div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={setNodes}
            onEdgesChange={setEdges}
            onConnect={connect}
            onDoubleClick={(event) =>
              openSearch(
                screenToFlowPosition({
                  x: event.clientX,
                  y: event.clientY,
                }),
              )
            }
            onNodeClick={(_, node) => selectNode(node.id)}
            onPaneClick={() => selectNode(null)}
            fitView
            minZoom={0.45}
            maxZoom={1.8}
            connectionMode={ConnectionMode.Loose}
            snapToGrid
            snapGrid={[16, 16]}
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: "#d9ff3f", strokeWidth: 1.6 },
            }}
          >
            <Background gap={24} size={1} color="rgba(146, 173, 206, 0.18)" />
            <MiniMap
              pannable
              zoomable
              nodeColor={(node) => {
                if (node.data.kind === "source") {
                  return "#62e7ff";
                }

                if (node.data.kind === "output") {
                  return "#d9ff3f";
                }

                if (node.data.kind === "logic") {
                  return "#ff7e8f";
                }

                return "#8c7bff";
              }}
            />
            <Controls />
            <FlowPanel position="bottom-left">
              <div className="floating-card">
                <strong>Canvas behavior</strong>
                <p>
                  Pan, zoom, connect, then compile. The flow remains responsive by keeping shared
                  state narrow and renderer work simple.
                </p>
              </div>
            </FlowPanel>
          </ReactFlow>

          <SearchOverlay />
        </section>

        <aside className="panel">
          <span className="panel-label">Compile inspector</span>
          <div className="inspector-grid">
            <div className="inspector-card">
              <h3>{compileResult.isValid ? "IR ready" : "Compile blocked"}</h3>
              <p>
                Execution order:{" "}
                {compileResult.executionOrder.length > 0
                  ? compileResult.executionOrder.join(" -> ")
                  : "not available"}
              </p>
            </div>

            <div className="inspector-card">
              <h3>Selected node</h3>
              <p>{selectedNode?.data.label ?? "No node selected"}</p>
              <pre className="code-block">{JSON.stringify(selectedNode?.data.params ?? {}, null, 2)}</pre>
            </div>

            <div className="inspector-card">
              <h3>IR snapshot</h3>
              <pre className="code-block">{JSON.stringify(compileResult, null, 2)}</pre>
            </div>

            <div className="inspector-card">
              <h3>Diagnostics</h3>
              <div className="diagnostic-list">
                {compileResult.diagnostics.length === 0 ? (
                  <div className="diagnostic-item">
                    <strong>No issues</strong>
                    <span>The current graph passed compile validation.</span>
                  </div>
                ) : (
                  compileResult.diagnostics.map((diagnostic, index) => (
                    <div className={`diagnostic-item ${diagnostic.level}`} key={`${diagnostic.message}-${index}`}>
                      <strong>{diagnostic.level.toUpperCase()}</strong>
                      <span>{diagnostic.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function EditorShell() {
  return (
    <ReactFlowProvider>
      <EditorCanvas />
    </ReactFlowProvider>
  );
}
