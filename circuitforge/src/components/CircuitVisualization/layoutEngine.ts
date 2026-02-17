import { DAGGraph, DAGNode, DAGEdge } from './dagBuilder';

export interface LayoutNode extends DAGNode {
  x: number;
  y: number;
}

export interface LayoutResult {
  nodes: LayoutNode[];
  edges: DAGEdge[];
  width: number;
  height: number;
}

const NODE_WIDTH = 80;
const NODE_HEIGHT = 36;
const H_GAP = 24;
const V_GAP = 50;
const PADDING = 30;

export function layoutDAG(graph: DAGGraph): LayoutResult {
  if (graph.nodes.length === 0) {
    return { nodes: [], edges: graph.edges, width: 0, height: 0 };
  }

  // Build adjacency: who are the parents (incoming edges) for each node?
  const parents = new Map<string, Set<string>>();
  const children = new Map<string, Set<string>>();
  for (const node of graph.nodes) {
    parents.set(node.id, new Set());
    children.set(node.id, new Set());
  }
  for (const edge of graph.edges) {
    parents.get(edge.to)?.add(edge.from);
    children.get(edge.from)?.add(edge.to);
  }

  // Assign layers via BFS from roots (nodes with no parents)
  const layerOf = new Map<string, number>();
  const roots = graph.nodes.filter(n => (parents.get(n.id)?.size ?? 0) === 0);

  // If there are no roots (cycle?), use all nodes as roots at layer 0
  const queue: string[] = roots.length > 0
    ? roots.map(n => { layerOf.set(n.id, 0); return n.id; })
    : graph.nodes.map(n => { layerOf.set(n.id, 0); return n.id; });

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentLayer = layerOf.get(current) ?? 0;
    for (const child of children.get(current) ?? []) {
      const existingLayer = layerOf.get(child);
      if (existingLayer === undefined || existingLayer < currentLayer + 1) {
        layerOf.set(child, currentLayer + 1);
        queue.push(child);
      }
    }
  }

  // Group nodes by layer
  const layers = new Map<number, DAGNode[]>();
  for (const node of graph.nodes) {
    const layer = layerOf.get(node.id) ?? 0;
    if (!layers.has(layer)) layers.set(layer, []);
    layers.get(layer)!.push(node);
  }

  const maxLayer = Math.max(...Array.from(layers.keys()), 0);

  // Position nodes
  const layoutNodes: LayoutNode[] = [];
  let maxRowWidth = 0;

  for (let layer = 0; layer <= maxLayer; layer++) {
    const nodesInLayer = layers.get(layer) ?? [];
    const rowWidth = nodesInLayer.length * NODE_WIDTH + (nodesInLayer.length - 1) * H_GAP;
    if (rowWidth > maxRowWidth) maxRowWidth = rowWidth;
    const y = PADDING + layer * (NODE_HEIGHT + V_GAP);

    nodesInLayer.forEach((node, i) => {
      const x = PADDING + i * (NODE_WIDTH + H_GAP);
      layoutNodes.push({ ...node, x, y });
    });
  }

  // Center each row horizontally
  const totalWidth = maxRowWidth + PADDING * 2;
  for (let layer = 0; layer <= maxLayer; layer++) {
    const nodesInLayer = layoutNodes.filter(n => {
      const l = layerOf.get(n.id) ?? 0;
      return l === layer;
    });
    const rowWidth = nodesInLayer.length * NODE_WIDTH + (nodesInLayer.length - 1) * H_GAP;
    const offset = (totalWidth - rowWidth) / 2 - PADDING;
    for (const node of nodesInLayer) {
      node.x += offset;
    }
  }

  const totalHeight = PADDING * 2 + (maxLayer + 1) * NODE_HEIGHT + maxLayer * V_GAP;

  return {
    nodes: layoutNodes,
    edges: graph.edges,
    width: Math.max(totalWidth, 200),
    height: Math.max(totalHeight, 100),
  };
}
