// Base for all nodes
export interface BaseNode {
  id: string; // Blockly block ID
  type: string;
}

// === Expression Nodes (produce a FieldElement value) ===

export interface PrivateInputNode extends BaseNode {
  type: 'private_input';
  name: string;
  dataType: 'felt252' | 'u32' | 'u128';
}

export interface PublicInputNode extends BaseNode {
  type: 'public_input';
  name: string;
  dataType: 'felt252' | 'u32' | 'u128';
}

export interface ConstantNode extends BaseNode {
  type: 'constant';
  value: string;
}

export interface BinaryOpNode extends BaseNode {
  type: 'binary_op';
  operator: 'add' | 'sub' | 'mul' | 'div' | 'mod' | 'bitwise_and' | 'bitwise_or' | 'bitwise_xor';
  left: ExpressionNode;
  right: ExpressionNode;
}

export interface HashNode extends BaseNode {
  type: 'hash';
  algorithm: 'poseidon' | 'pedersen';
  inputs: ExpressionNode[];
}

export interface UnaryOpNode extends BaseNode {
  type: 'unary_op';
  operator: 'bitwise_not';
  operand: ExpressionNode;
}

export type ExpressionNode =
  | PrivateInputNode
  | PublicInputNode
  | ConstantNode
  | BinaryOpNode
  | HashNode
  | UnaryOpNode;

// === Statement Nodes (constraints + outputs) ===

export interface AssertEqualNode extends BaseNode {
  type: 'assert_equal';
  left: ExpressionNode;
  right: ExpressionNode;
}

export interface AssertRangeNode extends BaseNode {
  type: 'assert_range';
  value: ExpressionNode;
  min: ExpressionNode;
  max: ExpressionNode;
}

export interface AssertNotZeroNode extends BaseNode {
  type: 'assert_not_zero';
  value: ExpressionNode;
}

export interface AssertGreaterThanNode extends BaseNode {
  type: 'assert_gt';
  left: ExpressionNode;
  right: ExpressionNode;
}

export interface PublicOutputNode extends BaseNode {
  type: 'public_output';
  name: string;
  value: ExpressionNode;
}

export type StatementNode =
  | AssertEqualNode
  | AssertRangeNode
  | AssertNotZeroNode
  | AssertGreaterThanNode
  | PublicOutputNode;

// === Top-level Circuit ===

export interface CircuitAST {
  name: string;
  statements: StatementNode[];
  privateInputs: PrivateInputNode[];
  publicInputs: PublicInputNode[];
}

// === Validation ===

export interface ValidationError {
  blockId: string;
  message: string;
  severity: 'error' | 'warning';
}
