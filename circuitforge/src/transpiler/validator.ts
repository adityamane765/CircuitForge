import {
  CircuitAST,
  ExpressionNode,
  StatementNode,
  ValidationError,
  PrivateInputNode,
  PublicInputNode,
} from './types';

// Helper to recursively check for undefined ExpressionNodes (missing inputs)
function checkMissingInputs(node: ExpressionNode | undefined, errors: ValidationError[], blockId: string) {
  if (node === undefined) {
    errors.push({
      blockId: blockId,
      message: `Missing input connection.`,
      severity: 'error',
    });
    return;
  }

  if (node.type === 'binary_op') {
    checkMissingInputs(node.left, errors, blockId);
    checkMissingInputs(node.right, errors, blockId);
  } else if (node.type === 'hash') {
    node.inputs.forEach(input => checkMissingInputs(input, errors, blockId));
  }
}

export function validateCircuit(ast: CircuitAST): ValidationError[] {
  const errors: ValidationError[] = [];

  // 1. Check for empty inputs in statement nodes
  ast.statements.forEach(statement => {
    if ('left' in statement) checkMissingInputs(statement.left, errors, statement.id);
    if ('right' in statement) checkMissingInputs(statement.right, errors, statement.id);
    if ('value' in statement) checkMissingInputs(statement.value, errors, statement.id);
    if ('min' in statement) checkMissingInputs(statement.min, errors, statement.id);
    if ('max' in statement) checkMissingInputs(statement.max, errors, statement.id);
  });

  // 2. Check for duplicate input names
  const privateInputNames = new Set<string>();
  ast.privateInputs.forEach(input => {
    if (privateInputNames.has(input.name)) {
      errors.push({
        blockId: input.id,
        message: `Duplicate private input name: '${input.name}'. Input names must be unique.`,
        severity: 'error',
      });
    }
    privateInputNames.add(input.name);
  });

  const publicInputNames = new Set<string>();
  ast.publicInputs.forEach(input => {
    if (publicInputNames.has(input.name)) {
      errors.push({
        blockId: input.id,
        message: `Duplicate public input name: '${input.name}'. Input names must be unique.`,
        severity: 'error',
      });
    }
    publicInputNames.add(input.name);
  });

  // 3. Check for no constraints
  const hasConstraints = ast.statements.some(s =>
    s.type === 'assert_equal' || s.type === 'assert_range' || s.type === 'assert_not_zero' || s.type === 'assert_gt'
  );
  if (!hasConstraints && ast.statements.length > 0) {
    errors.push({
      blockId: 'circuit', // Assign to a general circuit ID or first block if possible
      message: 'Circuit has no explicit constraint (e.g., Assert Equal, Assert Range).',
      severity: 'warning',
    });
  }

  // 4. Check for no statements at all
  if (ast.statements.length === 0) {
    errors.push({
      blockId: 'circuit', // Assign to a general circuit ID
      message: 'Empty circuit — add some blocks to the workspace.',
      severity: 'warning',
    });
  }

  return errors;
}
