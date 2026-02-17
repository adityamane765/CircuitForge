import { CircuitAST, ExpressionNode, StatementNode } from '@/transpiler/types';

export type DAGNodeKind = 'private_input' | 'public_input' | 'constant' | 'operation' | 'hash' | 'constraint' | 'output';

export interface DAGNode {
  id: string;
  label: string;
  kind: DAGNodeKind;
}

export interface DAGEdge {
  from: string;
  to: string;
}

export interface DAGGraph {
  nodes: DAGNode[];
  edges: DAGEdge[];
}

function getExprLabel(expr: ExpressionNode): string {
  switch (expr.type) {
    case 'private_input': return expr.name;
    case 'public_input': return expr.name;
    case 'constant': return expr.value;
    case 'binary_op': {
      const opSymbols: Record<string, string> = {
        add: '+', sub: '-', mul: '*', div: '/', mod: '%',
        bitwise_and: '&', bitwise_or: '|', bitwise_xor: '^',
      };
      return opSymbols[expr.operator] || expr.operator;
    }
    case 'unary_op': return '~';
    case 'hash': return expr.algorithm === 'poseidon' ? 'Poseidon' : 'Pedersen';
  }
}

function getExprKind(expr: ExpressionNode): DAGNodeKind {
  switch (expr.type) {
    case 'private_input': return 'private_input';
    case 'public_input': return 'public_input';
    case 'constant': return 'constant';
    case 'binary_op':
    case 'unary_op': return 'operation';
    case 'hash': return 'hash';
  }
}

function getStatementLabel(stmt: StatementNode): string {
  switch (stmt.type) {
    case 'assert_equal': return '==';
    case 'assert_range': return 'Range';
    case 'assert_not_zero': return '!= 0';
    case 'assert_gt': return '>';
    case 'public_output': return `Out: ${stmt.name}`;
  }
}

// Walk an expression tree, adding nodes and edges. Returns the root node's id.
function walkExpression(
  expr: ExpressionNode | undefined,
  nodes: Map<string, DAGNode>,
  edges: DAGEdge[]
): string | null {
  if (!expr) return null;

  // Use block ID as unique key (same block referenced multiple times = same node)
  if (!nodes.has(expr.id)) {
    nodes.set(expr.id, {
      id: expr.id,
      label: getExprLabel(expr),
      kind: getExprKind(expr),
    });
  }

  if (expr.type === 'binary_op') {
    const leftId = walkExpression(expr.left, nodes, edges);
    const rightId = walkExpression(expr.right, nodes, edges);
    if (leftId) edges.push({ from: leftId, to: expr.id });
    if (rightId) edges.push({ from: rightId, to: expr.id });
  } else if (expr.type === 'unary_op') {
    const operandId = walkExpression(expr.operand, nodes, edges);
    if (operandId) edges.push({ from: operandId, to: expr.id });
  } else if (expr.type === 'hash') {
    for (const input of expr.inputs) {
      const inputId = walkExpression(input, nodes, edges);
      if (inputId) edges.push({ from: inputId, to: expr.id });
    }
  }

  return expr.id;
}

export function buildDAG(ast: CircuitAST): DAGGraph {
  const nodes = new Map<string, DAGNode>();
  const edges: DAGEdge[] = [];

  for (const stmt of ast.statements) {
    // Add the statement node
    const stmtKind: DAGNodeKind = stmt.type === 'public_output' ? 'output' : 'constraint';
    nodes.set(stmt.id, {
      id: stmt.id,
      label: getStatementLabel(stmt),
      kind: stmtKind,
    });

    // Walk each expression field and connect to statement
    if (stmt.type === 'assert_equal' || stmt.type === 'assert_gt') {
      const leftId = walkExpression(stmt.left, nodes, edges);
      const rightId = walkExpression(stmt.right, nodes, edges);
      if (leftId) edges.push({ from: leftId, to: stmt.id });
      if (rightId) edges.push({ from: rightId, to: stmt.id });
    } else if (stmt.type === 'assert_range') {
      const valId = walkExpression(stmt.value, nodes, edges);
      const minId = walkExpression(stmt.min, nodes, edges);
      const maxId = walkExpression(stmt.max, nodes, edges);
      if (valId) edges.push({ from: valId, to: stmt.id });
      if (minId) edges.push({ from: minId, to: stmt.id });
      if (maxId) edges.push({ from: maxId, to: stmt.id });
    } else if (stmt.type === 'assert_not_zero') {
      const valId = walkExpression(stmt.value, nodes, edges);
      if (valId) edges.push({ from: valId, to: stmt.id });
    } else if (stmt.type === 'public_output') {
      const valId = walkExpression(stmt.value, nodes, edges);
      if (valId) edges.push({ from: valId, to: stmt.id });
    }
  }

  // Deduplicate edges
  const edgeSet = new Set<string>();
  const uniqueEdges = edges.filter(e => {
    const key = `${e.from}->${e.to}`;
    if (edgeSet.has(key)) return false;
    edgeSet.add(key);
    return true;
  });

  return { nodes: Array.from(nodes.values()), edges: uniqueEdges };
}
