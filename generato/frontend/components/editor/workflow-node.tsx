"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { GraphNodeData } from "@/types/graph";

const accentMap = {
  source: "#62e7ff",
  transform: "#8c7bff",
  logic: "#ff7e8f",
  output: "#d9ff3f",
} as const;

function WorkflowNodeComponent({ data, selected }: NodeProps<GraphNodeData>) {
  return (
    <div
      className={`node-card ${selected ? "is-selected" : ""}`}
      style={{ ["--node-accent" as string]: accentMap[data.kind] }}
    >
      <Handle position={Position.Left} type="target" />
      <header>
        <div>
          <span className="node-kind">{data.kind}</span>
          <h3 className="node-title">{data.label}</h3>
        </div>
      </header>
      <p className="node-description">{data.description}</p>
      <ul className="node-params">
        {Object.entries(data.params).map(([key, value]) => (
          <li key={key}>
            <span>{key}</span>
            <strong>{String(value)}</strong>
          </li>
        ))}
      </ul>
      <Handle position={Position.Right} type="source" />
    </div>
  );
}

export const WorkflowNode = memo(WorkflowNodeComponent);
