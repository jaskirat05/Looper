import type { Edge, Node, XYPosition } from "reactflow";

export type GraphNodeKind = "source" | "transform" | "logic" | "output";

export type NodeParamValue = string | number | boolean;

export type NodeDefinition = {
  type: string;
  label: string;
  kind: GraphNodeKind;
  description: string;
  defaults: Record<string, NodeParamValue>;
  tags: string[];
};

export type GraphNodeData = {
  type: string;
  label: string;
  kind: GraphNodeKind;
  description: string;
  params: Record<string, NodeParamValue>;
};

export type GraphNode = Node<GraphNodeData>;
export type GraphEdge = Edge;

export type SearchState = {
  isOpen: boolean;
  query: string;
  position: XYPosition;
};

export type CompileDiagnostic = {
  level: "error" | "warning" | "info";
  message: string;
  nodeId?: string;
};

export type GraphIRNode = {
  id: string;
  type: string;
  kind: GraphNodeKind;
  params: Record<string, NodeParamValue>;
};

export type GraphIR = {
  nodes: GraphIRNode[];
  edges: Array<{
    id: string;
    source: string;
    target: string;
  }>;
  executionOrder: string[];
  diagnostics: CompileDiagnostic[];
  isValid: boolean;
};
