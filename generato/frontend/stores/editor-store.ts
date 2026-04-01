"use client";

import { addEdge, applyEdgeChanges, applyNodeChanges } from "reactflow";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { compileGraph } from "@/lib/graph-compiler";
import { nodeDefinitions } from "@/lib/node-definitions";
import type {
  GraphEdge,
  GraphIR,
  GraphNode,
  GraphNodeData,
  SearchState,
} from "@/types/graph";

type EditorState = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  compileResult: GraphIR;
  search: SearchState;
  setNodes: (changes: Parameters<typeof applyNodeChanges<GraphNode>>[0]) => void;
  setEdges: (changes: Parameters<typeof applyEdgeChanges<GraphEdge>>[0]) => void;
  connect: (connection: Parameters<typeof addEdge>[0]) => void;
  selectNode: (nodeId: string | null) => void;
  updateNodeParams: (nodeId: string, params: Record<string, string | number | boolean>) => void;
  openSearch: (position: SearchState["position"]) => void;
  closeSearch: () => void;
  setSearchQuery: (query: string) => void;
  insertNode: (type: string) => void;
  compile: () => void;
};

function createNode(id: string, type: string, position: SearchState["position"]): GraphNode {
  const definition = nodeDefinitions.find((item) => item.type === type);

  if (!definition) {
    throw new Error(`Missing node definition for ${type}`);
  }

  const data: GraphNodeData = {
    type: definition.type,
    label: definition.label,
    kind: definition.kind,
    description: definition.description,
    params: definition.defaults,
  };

  return {
    id,
    type: "workflow",
    position,
    selected: false,
    data,
  };
}

const initialNodes: GraphNode[] = [
  createNode("prompt-1", "prompt", { x: 40, y: 90 }),
  createNode("camera-1", "camera", { x: 340, y: 120 }),
  createNode("style-1", "style", { x: 340, y: 290 }),
  createNode("render-1", "render", { x: 660, y: 195 }),
];

const initialEdges: GraphEdge[] = [
  {
    id: "edge-prompt-camera",
    source: "prompt-1",
    target: "camera-1",
    animated: true,
  },
  {
    id: "edge-camera-render",
    source: "camera-1",
    target: "render-1",
    animated: true,
  },
  {
    id: "edge-style-render",
    source: "style-1",
    target: "render-1",
    animated: true,
  },
];

const initialCompileResult = compileGraph(initialNodes, initialEdges);

export const useEditorStore = create<EditorState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  compileResult: initialCompileResult,
  search: {
    isOpen: false,
    query: "",
    position: { x: 320, y: 180 },
  },
  setNodes: (changes) =>
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    })),
  setEdges: (changes) =>
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    })),
  connect: (connection) =>
    set((state) => ({
      edges: addEdge(
        {
          ...connection,
          id: `${connection.source}-${connection.target}-${state.edges.length + 1}`,
          animated: true,
        },
        state.edges,
      ),
    })),
  selectNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.map((node) => ({
        ...node,
        selected: node.id === nodeId,
      })),
    })),
  updateNodeParams: (nodeId, params) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                params: {
                  ...node.data.params,
                  ...params,
                },
              },
            }
          : node,
      ),
    })),
  openSearch: (position) =>
    set((state) => ({
      search: {
        ...state.search,
        isOpen: true,
        query: "",
        position,
      },
    })),
  closeSearch: () =>
    set((state) => ({
      search: {
        ...state.search,
        isOpen: false,
        query: "",
      },
    })),
  setSearchQuery: (query) =>
    set((state) => ({
      search: {
        ...state.search,
        query,
      },
    })),
  insertNode: (type) =>
    set((state) => {
      const nextIndex = state.nodes.length + 1;
      const node = createNode(`${type}-${nextIndex}`, type, state.search.position);

      return {
        nodes: [...state.nodes, node],
        search: {
          ...state.search,
          isOpen: false,
          query: "",
        },
      };
    }),
  compile: () =>
    set((state) => ({
      compileResult: compileGraph(state.nodes, state.edges),
    })),
}));

export const useGraphState = () =>
  useEditorStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      setNodes: state.setNodes,
      setEdges: state.setEdges,
      connect: state.connect,
      openSearch: state.openSearch,
      selectNode: state.selectNode,
      compile: state.compile,
    })),
  );

export const useSearchState = () =>
  useEditorStore(
    useShallow((state) => ({
      search: state.search,
      closeSearch: state.closeSearch,
      setSearchQuery: state.setSearchQuery,
      insertNode: state.insertNode,
    })),
  );

export const useCompileState = () =>
  useEditorStore(
    useShallow((state) => ({
      compileResult: state.compileResult,
      nodes: state.nodes,
    })),
  );
