"use client";

import { CircuitAST, ExpressionNode } from '@/transpiler/types';
import { hash } from 'starknet'; // Using the hash namespace from starknet.js

export interface TestResult {
  statementIndex: number;
  blockId: string;
  type: string;
  passed: boolean;
  message: string;
}

function hexToBigInt(hex: string): bigint {
  if (!hex.startsWith('0x')) {
    throw new Error(`Invalid hex string: ${hex}`);
  }
  return BigInt(hex);
}

function bigIntToHex(value: bigint): string {
  return '0x' + value.toString(16);
}

export function evaluateCircuit(
  ast: CircuitAST,
  inputValues: Record<string, string>
): TestResult[] {
  const results: TestResult[] = [];
  const nameMap = new Map<string, bigint>();

  // 1. Build initial value map from inputValues (keyed by name, not block ID)
  for (const input of [...ast.privateInputs, ...ast.publicInputs]) {
    const value = inputValues[input.name];
    if (value === undefined || value === '') {
      results.push({
        statementIndex: -1, // No specific statement
        blockId: input.id,
        type: input.type,
        passed: false,
        message: `Missing value for input: ${input.name}`,
      });
      return results; // Stop if any required input is missing
    }
    try {
      // Handle both hex and decimal strings
      nameMap.set(input.name, value.startsWith('0x') ? BigInt(value) : BigInt(value));
    } catch (e: any) {
      results.push({
        statementIndex: -1,
        blockId: input.id,
        type: input.type,
        passed: false,
        message: `Invalid value for input ${input.name}: ${e.message}`,
      });
      return results;
    }
  }

  // Helper to evaluate expressions
  const evaluateExpression = (expr: ExpressionNode): bigint => {
    switch (expr.type) {
      case 'private_input':
      case 'public_input': {
        const val = nameMap.get(expr.name);
        if (val === undefined) throw new Error(`Missing value for input: ${expr.name}`);
        return val;
      }
      case 'constant':
        return BigInt(expr.value);
      case 'binary_op': {
        const left = evaluateExpression(expr.left);
        const right = evaluateExpression(expr.right);
        switch (expr.operator) {
          case 'add':
            return left + right;
          case 'sub':
            return left - right;
          case 'mul':
            return left * right;
          case 'div':
            if (right === 0n) throw new Error('Division by zero');
            return left / right; // BigInt division
          case 'mod':
            if (right === 0n) throw new Error('Modulo by zero');
            return left % right;
          case 'bitwise_and':
            return left & right;
          case 'bitwise_or':
            return left | right;
          case 'bitwise_xor':
            return left ^ right;
        }
      }
      case 'unary_op': {
        const operand = evaluateExpression(expr.operand);
        switch (expr.operator) {
          case 'bitwise_not':
            return ~operand;
        }
      }
      case 'hash': {
        const inputHashes = expr.inputs.map(evaluateExpression);
        let computedHash: string;

        // Ensure exactly two inputs for hashing or pad with 0
        const input1 = bigIntToHex(inputHashes[0]);
        const input2 = inputHashes.length > 1 ? bigIntToHex(inputHashes[1]) : bigIntToHex(0n);

        switch (expr.algorithm) {
          case 'poseidon':
            computedHash = hash.computePoseidonHash(input1, input2);
            break;
          case 'pedersen':
            computedHash = hash.computePedersenHash(input1, input2);
            break;
          default:
            throw new Error(`Unknown hash algorithm: ${expr.algorithm}`);
        }
        return hexToBigInt(computedHash);
      }
    }
  };

  ast.statements.forEach((statement, index) => {
    try {
      switch (statement.type) {
        case 'assert_equal': {
          const left = evaluateExpression(statement.left);
          const right = evaluateExpression(statement.right);
          const passed = left === right;
          results.push({
            statementIndex: index,
            blockId: statement.id,
            type: statement.type,
            passed,
            message: passed ? 'PASS' : `${bigIntToHex(left)} != ${bigIntToHex(right)}`,
          });
          break;
        }
        case 'assert_range': {
          const value = evaluateExpression(statement.value);
          const min = evaluateExpression(statement.min);
          const max = evaluateExpression(statement.max);
          const passed = value >= min && value <= max;
          results.push({
            statementIndex: index,
            blockId: statement.id,
            type: statement.type,
            passed,
            message: passed ? 'PASS' : `${bigIntToHex(value)} not in range [${bigIntToHex(min)}, ${bigIntToHex(max)}]`,
          });
          break;
        }
        case 'assert_not_zero': {
          const value = evaluateExpression(statement.value);
          const passed = value !== 0n;
          results.push({
            statementIndex: index,
            blockId: statement.id,
            type: statement.type,
            passed,
            message: passed ? 'PASS' : `${bigIntToHex(value)} is zero`,
          });
          break;
        }
        case 'assert_gt': {
          const left = evaluateExpression(statement.left);
          const right = evaluateExpression(statement.right);
          const passed = left > right;
          results.push({
            statementIndex: index,
            blockId: statement.id,
            type: statement.type,
            passed,
            message: passed ? 'PASS' : `${bigIntToHex(left)} is not > ${bigIntToHex(right)}`,
          });
          break;
        }
        case 'public_output': {
          const value = evaluateExpression(statement.value);
          results.push({
            statementIndex: index,
            blockId: statement.id,
            type: statement.type,
            passed: true, // Output is always "passed" if computed
            message: `Output ${statement.name}: ${bigIntToHex(value)}`,
          });
          break;
        }
      }
    } catch (e: any) {
      results.push({
        statementIndex: index,
        blockId: statement.id,
        type: statement.type,
        passed: false,
        message: `Evaluation error: ${e.message}`,
      });
    }
  });

  return results;
}
