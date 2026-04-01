import type { GraphEdge, GraphIR, GraphNode, CompileDiagnostic } from "@/types/graph";

function compareIds(a: string, b: string) {
  return a.localeCompare(b);
}

export function compileGraph(nodes: GraphNode[], edges: GraphEdge[]): GraphIR {
  const sortedNodes = [...nodes].sort((a, b) => compareIds(a.id, b.id));
  const sortedEdges = [...edges].sort((a, b) => compareIds(a.id, b.id));
  const diagnostics: CompileDiagnostic[] = [];
  const nodeMap = new Map(sortedNodes.map((node) => [node.id, node]));
  const indegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const node of sortedNodes) {
    indegree.set(node.id, 0);
    adjacency.set(node.id, []);
  }

  for (const edge of sortedEdges) {
    if (!nodeMap.has(edge.source) || !nodeMap.has(edge.target)) {
      diagnostics.push({
        level: "error",
        message: `Edge ${edge.id} references a missing node.`,
      });
      continue;
    }

    adjacency.get(edge.source)?.push(edge.target);
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1);
  }

  for (const node of sortedNodes) {
    const incoming = sortedEdges.filter((edge) => edge.target === node.id).length;
    const outgoing = sortedEdges.filter((edge) => edge.source === node.id).length;

    if (node.data.kind !== "source" && incoming === 0) {
      diagnostics.push({
        level: "warning",
        message: `${node.data.label} has no upstream dependency.`,
        nodeId: node.id,
      });
    }

    if (node.data.kind !== "output" && outgoing === 0) {
      diagnostics.push({
        level: "warning",
        message: `${node.data.label} is not connected to a downstream node.`,
        nodeId: node.id,
      });
    }
  }

  const queue = [...sortedNodes]
    .map((node) => node.id)
    .filter((id) => (indegree.get(id) ?? 0) === 0)
    .sort(compareIds);
  const executionOrder: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current) {
      break;
    }

    executionOrder.push(current);

    for (const target of adjacency.get(current) ?? []) {
      const nextDegree = (indegree.get(target) ?? 0) - 1;
      indegree.set(target, nextDegree);

      if (nextDegree === 0) {
        queue.push(target);
        queue.sort(compareIds);
      }
    }
  }

  if (executionOrder.length !== sortedNodes.length) {
    diagnostics.push({
      level: "error",
      message: "The graph contains a cycle, so execution order could not be resolved.",
    });
  }

  return {
    nodes: sortedNodes.map((node) => ({
      id: node.id,
      type: node.data.type,
      kind: node.data.kind,
      params: node.data.params,
    })),
    edges: sortedEdges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
    })),
    executionOrder,
    diagnostics,
    isValid: diagnostics.every((diagnostic) => diagnostic.level !== "error"),
  };
}
