import * as Blockly from 'blockly';
import {
  CircuitAST,
  ExpressionNode,
  StatementNode,
  PrivateInputNode,
  PublicInputNode,
  ConstantNode,
  BinaryOpNode,
  HashNode,
  AssertEqualNode,
  AssertRangeNode,
  AssertNotZeroNode,
  PublicOutputNode,
} from './types';

// Helper to parse a single expression block
function parseExpression(block: Blockly.Block | null): ExpressionNode | undefined {
  if (!block) return undefined;

  const base: { id: string; type: string } = {
    id: block.id,
    type: block.type, // This will be overridden by specific node types
  };

  switch (block.type) {
    case 'cairo_private_input':
      return {
        ...base,
        type: 'private_input',
        name: block.getFieldValue('NAME'),
        dataType: block.getFieldValue('TYPE'),
      } as PrivateInputNode;
    case 'cairo_public_input':
      return {
        ...base,
        type: 'public_input',
        name: block.getFieldValue('NAME'),
        dataType: block.getFieldValue('TYPE'),
      } as PublicInputNode;
    case 'cairo_constant':
      return {
        ...base,
        type: 'constant',
        value: String(block.getFieldValue('VALUE')), // Ensure value is string
      } as ConstantNode;
    case 'cairo_add':
    case 'cairo_sub':
    case 'cairo_mul':
    case 'cairo_div':
      return {
        ...base,
        type: 'binary_op',
        operator: block.type.replace('cairo_', '') as BinaryOpNode['operator'],
        left: parseExpression(block.getInputTargetBlock('LEFT')),
        right: parseExpression(block.getInputTargetBlock('RIGHT')),
      } as BinaryOpNode;
    case 'cairo_poseidon_hash':
      return {
        ...base,
        type: 'hash',
        algorithm: 'poseidon',
        inputs: [
          parseExpression(block.getInputTargetBlock('VALUE1')),
          parseExpression(block.getInputTargetBlock('VALUE2')),
        ].filter(Boolean) as ExpressionNode[],
      } as HashNode;
    case 'cairo_pedersen_hash':
      return {
        ...base,
        type: 'hash',
        algorithm: 'pedersen',
        inputs: [
          parseExpression(block.getInputTargetBlock('LEFT')),
          parseExpression(block.getInputTargetBlock('RIGHT')),
        ].filter(Boolean) as ExpressionNode[],
      } as HashNode;
    default:
      console.warn(`Unknown expression block type: ${block.type}`);
      return undefined;
  }
}

// Helper to parse a single statement block
function parseStatement(block: Blockly.Block | null): StatementNode | undefined {
  if (!block) return undefined;

  const base: { id: string; type: string } = {
    id: block.id,
    type: block.type, // This will be overridden by specific node types
  };

  switch (block.type) {
    case 'cairo_assert_equal':
      return {
        ...base,
        type: 'assert_equal',
        left: parseExpression(block.getInputTargetBlock('LEFT')),
        right: parseExpression(block.getInputTargetBlock('RIGHT')),
      } as AssertEqualNode;
    case 'cairo_assert_range':
      return {
        ...base,
        type: 'assert_range',
        value: parseExpression(block.getInputTargetBlock('VALUE')),
        min: parseExpression(block.getInputTargetBlock('MIN')),
        max: parseExpression(block.getInputTargetBlock('MAX')),
      } as AssertRangeNode;
    case 'cairo_assert_not_zero':
      return {
        ...base,
        type: 'assert_not_zero',
        value: parseExpression(block.getInputTargetBlock('VALUE')),
      } as AssertNotZeroNode;
    case 'cairo_public_output':
      return {
        ...base,
        type: 'public_output',
        name: block.getFieldValue('NAME'),
        value: parseExpression(block.getInputTargetBlock('VALUE')),
      } as PublicOutputNode;
    default:
      console.warn(`Unknown statement block type: ${block.type}`);
      return undefined;
  }
}

// Helper to recursively collect input nodes from an ExpressionNode
function collectInputNodes(
  node: ExpressionNode | undefined,
  privateInputs: Map<string, PrivateInputNode>,
  publicInputs: Map<string, PublicInputNode>
) {
  if (!node) return;

  if (node.type === 'private_input') {
    privateInputs.set(node.name, node);
  } else if (node.type === 'public_input') {
    publicInputs.set(node.name, node);
  } else if (node.type === 'binary_op') {
    collectInputNodes(node.left, privateInputs, publicInputs);
    collectInputNodes(node.right, privateInputs, publicInputs);
  } else if (node.type === 'hash') {
    node.inputs.forEach(input => collectInputNodes(input, privateInputs, publicInputs));
  }
}

export function parseWorkspace(workspace: Blockly.WorkspaceSvg): CircuitAST {
  const statements: StatementNode[] = [];
  const privateInputs = new Map<string, PrivateInputNode>();
  const publicInputs = new Map<string, PublicInputNode>();

  // Get all top-level blocks that are statements (have previous/next connections)
  const topStatementBlocks = workspace.getTopBlocks(true).filter(block => block.previousConnection);

  for (const startBlock of topStatementBlocks) {
    let currentBlock: Blockly.Block | null = startBlock;
    while (currentBlock) {
      const statementNode = parseStatement(currentBlock);
      if (statementNode) {
        statements.push(statementNode);
        // Collect inputs used within this statement
        if ('left' in statementNode) collectInputNodes(statementNode.left, privateInputs, publicInputs);
        if ('right' in statementNode) collectInputNodes(statementNode.right, privateInputs, publicInputs);
        if ('value' in statementNode) collectInputNodes(statementNode.value, privateInputs, publicInputs);
        if ('min' in statementNode) collectInputNodes(statementNode.min, privateInputs, publicInputs);
        if ('max' in statementNode) collectInputNodes(statementNode.max, privateInputs, publicInputs);
      }
      currentBlock = currentBlock.getNextBlock();
    }
  }

  return {
    name: "Circuit", // Default name
    statements: statements,
    privateInputs: Array.from(privateInputs.values()),
    publicInputs: Array.from(publicInputs.values()),
  };
}
