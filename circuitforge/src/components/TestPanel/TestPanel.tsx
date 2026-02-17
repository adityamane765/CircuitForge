"use client";

import React, { useState, useEffect } from 'react';
import { CircuitAST } from '@/transpiler/types';
import { evaluateCircuit, TestResult } from './evaluator';
import { hash } from 'starknet';
import { useTheme } from '@/context/ThemeContext';

interface TestPanelProps {
  ast: CircuitAST | null;
}

const TestPanel: React.FC<TestPanelProps> = ({ ast }) => {
  const { theme } = useTheme();
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Hash helper state
  const [showHashHelper, setShowHashHelper] = useState(false);
  const [hashAlgorithm, setHashAlgorithm] = useState<'poseidon' | 'pedersen'>('poseidon');
  const [hashInput1, setHashInput1] = useState('');
  const [hashInput2, setHashInput2] = useState('');
  const [hashResult, setHashResult] = useState<string | null>(null);
  const [hashError, setHashError] = useState<string | null>(null);

  useEffect(() => {
    if (ast) {
      const initialValues: Record<string, string> = {};
      [...ast.privateInputs, ...ast.publicInputs].forEach((input) => {
        initialValues[input.name] = '';
      });
      setInputValues(initialValues);
      setTestResults(null);
    }
  }, [ast]);

  const handleInputChange = (name: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleRunTests = async () => {
    if (!ast) return;
    setIsRunning(true);
    try {
      const results = evaluateCircuit(ast, inputValues);
      setTestResults(results);
    } catch (error: any) {
      setTestResults([{
        statementIndex: -1,
        blockId: 'evaluator-error',
        type: 'error',
        passed: false,
        message: `Unhandled evaluation error: ${error.message}`,
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const computeHash = () => {
    setHashError(null);
    setHashResult(null);
    try {
      if (!hashInput1.trim()) {
        setHashError('Enter at least one value');
        return;
      }
      const v1 = hashInput1.trim().startsWith('0x')
        ? hashInput1.trim()
        : '0x' + BigInt(hashInput1.trim()).toString(16);
      const v2 = hashInput2.trim()
        ? (hashInput2.trim().startsWith('0x')
          ? hashInput2.trim()
          : '0x' + BigInt(hashInput2.trim()).toString(16))
        : '0x0';

      const result = hashAlgorithm === 'poseidon'
        ? hash.computePoseidonHash(v1, v2)
        : hash.computePedersenHash(v1, v2);
      setHashResult(result);
    } catch (e: any) {
      setHashError(e.message || 'Invalid input');
    }
  };

  if (!ast) {
    return <div className="p-4" style={{ color: theme.textMuted }}>Build a circuit to run tests.</div>;
  }

  const inputs = [...ast.privateInputs, ...ast.publicInputs];
  const constraints = ast.statements.filter(s => s.type.startsWith('assert'));

  if (inputs.length === 0 && constraints.length === 0) {
    return (
      <div className="p-4" style={{ color: theme.textMuted }}>
        No inputs or constraints detected in the circuit. Add some blocks to test.
      </div>
    );
  }

  const allInputsFilled = inputs.every(input => inputValues[input.name] !== '');

  const inputStyle: React.CSSProperties = {
    backgroundColor: theme.bgTertiary,
    color: theme.text,
    borderColor: theme.border,
  };

  return (
    <div className="flex h-full min-h-0 flex-col p-4 overflow-hidden" style={{ color: theme.text }}>
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h3 className="text-lg font-semibold">Test Circuit</h3>
        <button
          onClick={() => setShowHashHelper(!showHashHelper)}
          className="text-xs px-2 py-1 rounded transition-colors"
          style={{ backgroundColor: showHashHelper ? theme.accent : theme.btnBg, color: showHashHelper ? '#fff' : theme.textMuted }}
        >
          #Hash Helper
        </button>
      </div>

      {/* Hash Helper */}
      {showHashHelper && (
        <div className="mb-3 rounded-md border p-3 shrink-0" style={{ borderColor: theme.border, backgroundColor: theme.bg }}>
          <div className="flex items-center space-x-2 mb-2">
            <select
              value={hashAlgorithm}
              onChange={(e) => setHashAlgorithm(e.target.value as 'poseidon' | 'pedersen')}
              className="rounded px-2 py-1 text-xs border focus:outline-none"
              style={inputStyle}
            >
              <option value="poseidon">Poseidon</option>
              <option value="pedersen">Pedersen</option>
            </select>
            <span className="text-xs" style={{ color: theme.textMuted }}>Compute hash to use as test input</span>
          </div>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={hashInput1}
              onChange={(e) => setHashInput1(e.target.value)}
              placeholder="Value 1 (e.g. 42)"
              className="flex-1 rounded px-2 py-1 text-xs focus:outline-none"
              style={inputStyle}
            />
            <input
              type="text"
              value={hashInput2}
              onChange={(e) => setHashInput2(e.target.value)}
              placeholder="Value 2 (optional)"
              className="flex-1 rounded px-2 py-1 text-xs focus:outline-none"
              style={inputStyle}
            />
            <button
              onClick={computeHash}
              className="rounded px-3 py-1 text-xs text-white"
              style={{ backgroundColor: theme.accent }}
            >
              Hash
            </button>
          </div>
          {hashError && (
            <p className="text-xs" style={{ color: theme.red }}>{hashError}</p>
          )}
          {hashResult && (
            <div className="flex items-center space-x-2">
              <p className="text-xs font-mono break-all flex-1" style={{ color: theme.green }}>{hashResult}</p>
              <button
                onClick={() => navigator.clipboard.writeText(hashResult)}
                className="shrink-0 rounded px-2 py-1 text-xs"
                style={{ backgroundColor: theme.btnBg, color: theme.textMuted }}
              >
                Copy
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mb-3 shrink-0">
        <h4 className="mb-2 text-sm font-medium">Inputs:</h4>
        {inputs.length === 0 ? (
          <p className="text-sm" style={{ color: theme.textMuted }}>No inputs defined for this circuit.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {inputs.map((input) => (
              <div key={input.id} className="flex flex-col space-y-1">
                <label htmlFor={`input-${input.name}`} className="text-sm" style={{ color: theme.text }}>
                  {input.name} <span style={{ color: theme.textMuted }}>({input.dataType})</span>
                </label>
                <input
                  id={`input-${input.name}`}
                  type="text"
                  value={inputValues[input.name] || ''}
                  onChange={(e) => handleInputChange(input.name, e.target.value)}
                  className="rounded-md px-3 py-2 text-sm border focus:outline-none"
                  style={inputStyle}
                  placeholder={input.type === 'private_input' ? 'e.g. 42 or 0x2a' : 'e.g. 100 or 0x64'}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleRunTests}
        disabled={isRunning || !allInputsFilled}
        className="mb-3 w-full rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        style={{ backgroundColor: theme.accent }}
      >
        {isRunning ? 'Running...' : 'Run Tests'}
      </button>

      <h4 className="mb-2 text-sm font-medium shrink-0">Results:</h4>
      <div className="flex-1 overflow-y-auto scrollbar-hidden rounded-md border p-3" style={{ borderColor: theme.border, backgroundColor: theme.bg }}>
        {testResults === null ? (
          <p className="text-sm" style={{ color: theme.textMuted }}>Enter inputs and run tests to see results.</p>
        ) : testResults.length === 0 ? (
          <p className="text-sm" style={{ color: theme.textMuted }}>No testable constraints found.</p>
        ) : (
          <div className="space-y-2">
            {testResults.map((result, idx) => (
              <div key={idx} className="rounded-md p-2" style={{ backgroundColor: result.passed ? `${theme.green}15` : `${theme.red}15` }}>
                <span className="font-semibold" style={{ color: result.passed ? theme.green : theme.red }}>
                  {result.passed ? 'PASS' : 'FAIL'}
                </span>{' '}
                <span className="text-sm" style={{ color: theme.textMuted }}>({result.type.replace('_', ' ')})</span>
                <p className="text-sm mt-1" style={{ color: theme.textMuted }}>{result.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestPanel;
