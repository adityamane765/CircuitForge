import { CircuitAST, ExpressionNode, StatementNode } from '@/transpiler/types';

const GAS_COSTS: Record<string, number> = {
  // Inputs — negligible (just variable declarations)
  'private_input':    10,
  'public_input':     10,
  'constant':         5,

  // Arithmetic — cheap (single felt252 operations)
  'binary_op_add':    20,
  'binary_op_sub':    20,
  'binary_op_mul':    25,
  'binary_op_div':    40,   // Division is more expensive (modular inverse)

  // Hashing — the expensive operations
  'hash_poseidon':    500,  // ~500 steps (Hades permutation)
  'hash_pedersen':    4000, // ~4000 steps (elliptic curve)

  // Constraints — range checks use builtins
  'assert_equal':     15,
  'assert_range':     75,   // Uses range check builtin
  'assert_not_zero':  20,

  // Output
  'public_output':    10,
};

export interface GasEstimate {
  totalSteps: number;
  estimatedGas: number;
  complexity: 'Low' | 'Medium' | 'High';
  breakdown: { block: string; cost: number }[];
}

export function estimateGas(ast: CircuitAST): GasEstimate {
  let totalSteps = 0;
  const breakdown: { block: string; cost: number }[] = [];

  const addCost = (blockType: string, count = 1) => {
    const cost = (GAS_COSTS[blockType] || 0) * count;
    totalSteps += cost;
    breakdown.push({ block: blockType, cost });
  };

  function walkExpressionNode(node: ExpressionNode) {
    if (!node) return; // Handle undefined/null nodes gracefully

    let key: string = node.type;
    if (node.type === 'binary_op') {
      key = `binary_op_${node.operator}`;
    } else if (node.type === 'hash') {
      key = `hash_${node.algorithm}`;
    }
    addCost(key);

    // Recurse into children
    if ('left' in node && node.left) walkExpressionNode(node.left);
    if ('right' in node && node.right) walkExpressionNode(node.right);
    if ('inputs' in node) node.inputs.forEach(walkExpressionNode);
  }

  function walkStatementNode(node: StatementNode) {
    if (!node) return; // Handle undefined/null nodes gracefully

    addCost(node.type);

    // Recurse into children expressions
    if ('left' in node && node.left) walkExpressionNode(node.left);
    if ('right' in node && node.right) walkExpressionNode(node.right);
    if ('value' in node && typeof node.value === 'object') walkExpressionNode(node.value);
    if ('min' in node && typeof node.min === 'object') walkExpressionNode(node.min);
    if ('max' in node && typeof node.max === 'object') walkExpressionNode(node.max);
  }

  ast.statements.forEach(walkStatementNode);

  // Convert steps to estimated gas (rough: 1 step ≈ 0.0025 gas units on Starknet)
  // 1e9 for Gwei conversion if needed, but the spec says "in wei" so keep as base units
  // Estimated gas is typically in gwei, 0.0025 gas units.
  // The value is in wei, so 0.0025 * 10^18. Simplified to 2.5 * 10^15.
  // The provided spec has 0.0025 * 1e9, which would be in Gwei.
  // I will follow the spec's provided calculation, which implies the estimatedGas is in a unit smaller than wei, but directly proportional.
  const estimatedGas = Math.ceil(totalSteps * 0.0025 * 1e9);

  let complexity: 'Low' | 'Medium' | 'High';
  if (totalSteps < 500) {
    complexity = 'Low';
  } else if (totalSteps < 5000) {
    complexity = 'Medium';
  } else {
    complexity = 'High';
  }

  return {
    totalSteps,
    estimatedGas,
    complexity,
    breakdown,
  };
}
