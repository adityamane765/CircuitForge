import {
  CircuitAST,
  ExpressionNode,
} from './types';

interface GenerationState {
  vars: { [key: string]: number };
  computations: string[];
  imports: Set<string>;
}

function getVarName(prefix: string, state: GenerationState): string {
  const count = state.vars[prefix] || 0;
  state.vars[prefix] = count + 1;
  return `${prefix}_${count}`;
}

function emitExpression(node: ExpressionNode | undefined, state: GenerationState): string {
  if (!node) {
    return '0';
  }

  switch (node.type) {
    case 'private_input':
    case 'public_input':
      return node.name;
    case 'constant':
      return node.value;
    case 'binary_op': {
      const left = emitExpression(node.left, state);
      const right = emitExpression(node.right, state);
      const ops = { add: '+', sub: '-', mul: '*', div: '/' };
      return `(${left} ${ops[node.operator]} ${right})`;
    }
    case 'hash': {
      state.imports.add('core::hash::{HashStateExTrait, HashStateTrait}');
      if (node.algorithm === 'poseidon') {
        state.imports.add('core::poseidon::PoseidonTrait');
      } else {
        state.imports.add('core::pedersen::PedersenTrait');
      }

      const hashVar = getVarName(node.algorithm, state);
      const hashInit = node.algorithm === 'poseidon'
        ? 'PoseidonTrait::new()'
        : 'PedersenTrait::new(0)';

      const updates = node.inputs.map(input => {
        const expr = emitExpression(input, state);
        return `        .update(${expr})`;
      });

      state.computations.push(
        `    let ${hashVar} = ${hashInit}\n${updates.join('\n')}\n        .finalize();`
      );
      return hashVar;
    }
    default:
      return '0';
  }
}

export function generateCairo(ast: CircuitAST): string {
  const state: GenerationState = {
    vars: {},
    computations: [],
    imports: new Set<string>(),
  };

  // First pass: emit all statements to collect imports and computations
  const constraintLines: string[] = [];

  ast.statements.forEach(statement => {
    if (statement.type === 'assert_equal') {
      const leftExpr = emitExpression(statement.left, state);
      const rightExpr = emitExpression(statement.right, state);
      constraintLines.push(`    assert!(${leftExpr} == ${rightExpr}, '${leftExpr} != ${rightExpr}');`);
    } else if (statement.type === 'assert_range') {
      const valueExpr = emitExpression(statement.value, state);
      const minExpr = emitExpression(statement.min, state);
      const maxExpr = emitExpression(statement.max, state);
      constraintLines.push(`    assert!(${valueExpr} >= ${minExpr}, 'below minimum');`);
      constraintLines.push(`    assert!(${valueExpr} <= ${maxExpr}, 'above maximum');`);
    } else if (statement.type === 'assert_not_zero') {
      const valueExpr = emitExpression(statement.value, state);
      constraintLines.push(`    assert!(${valueExpr} != 0, 'value is zero');`);
    } else if (statement.type === 'public_output') {
      const valueExpr = emitExpression(statement.value, state);
      constraintLines.push(`    // Output: ${statement.name} = ${valueExpr}`);
    }
  });

  // Build final output
  const lines: string[] = [];

  // Imports
  const sortedImports = Array.from(state.imports).sort();
  if (sortedImports.length > 0) {
    sortedImports.forEach(imp => lines.push(`use ${imp};`));
    lines.push('');
  }

  // Function signature
  const params = ast.publicInputs
    .map(input => `${input.name}: felt252`)
    .join(', ');
  lines.push(`fn main(${params}) {`);

  // Private inputs
  if (ast.privateInputs.length > 0) {
    lines.push('    // Private inputs');
    ast.privateInputs.forEach(input => {
      lines.push(`    let ${input.name}: felt252 = 0;`);
    });
    lines.push('');
  }

  // Computations (hashes, etc.)
  if (state.computations.length > 0) {
    lines.push('    // Computations');
    state.computations.forEach(comp => lines.push(comp));
    lines.push('');
  }

  // Constraints
  if (constraintLines.length > 0) {
    lines.push('    // Constraints');
    constraintLines.forEach(line => lines.push(line));
  }

  lines.push('}');

  return lines.join('\n');
}