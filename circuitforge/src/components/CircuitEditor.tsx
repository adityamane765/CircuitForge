"use client";

import React, { useState, useCallback, useRef } from 'react';
import BlocklyWorkspace from './BlocklyEditor/BlocklyWorkspace';
import * as Blockly from 'blockly'; // Import Blockly to use Blockly.WorkspaceSvg

// Transpiler imports
import { parseWorkspace } from '@/transpiler/parser';
import { validateCircuit } from '@/transpiler/validator';
import { generateCairo } from '@/transpiler/generator';
import { ValidationError } from '@/transpiler/types';

// Monaco Editor imports
import CairoEditor from './CodePreview/CairoEditor';

const CircuitEditor: React.FC = () => {
  const [cairoCode, setCairoCode] = useState<string>('// Drag and drop blocks to generate Cairo code!');
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [constraintCount, setConstraintCount] = useState<number>(0);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Placeholder for onWorkspaceChange
  const handleWorkspaceChange = useCallback((workspace: Blockly.WorkspaceSvg) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      const ast = parseWorkspace(workspace);
      const validationErrors = validateCircuit(ast);
      const errorOnly = validationErrors.filter(e => e.severity === 'error');

      let generatedCode = '';
      if (errorOnly.length === 0) {
        try {
          generatedCode = generateCairo(ast);
        } catch (genError: any) {
          generatedCode = `// Error generating Cairo code: ${genError.message || 'Unknown error'}`;
          validationErrors.push({
            blockId: 'generator',
            message: genError.message || 'Unknown error during code generation.',
            severity: 'error',
          });
        }
      } else {
        generatedCode = '// Fix errors in your blocks to generate Cairo code.';
      }

      const currentConstraintCount = ast.statements.filter(s =>
        s.type === 'assert_equal' || s.type === 'assert_range' || s.type === 'assert_not_zero'
      ).length;

      setCairoCode(generatedCode);
      setErrors(validationErrors);
      setConstraintCount(currentConstraintCount);
    }, 200); // Debounce by 200ms
  }, []);

  return (
    <div className="flex flex-col h-screen w-full bg-gray-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-gray-800 shadow-md">
        <h1 className="text-2xl font-bold text-blue-400">⚡ CircuitForge</h1>
        <div className="flex space-x-4">
          <button className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600">Templates</button>
          <button className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600">Save</button>
          <button className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600">Load</button>
          <button className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600">Export .cairo</button>
          <span className="flex items-center space-x-2">
            <span>Constraints: {constraintCount}</span>
            <span className="text-green-400">📊</span>
          </span>
          <button className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 font-semibold">Deploy to Starknet</button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Blockly Workspace */}
        <div className="flex-grow-[3] w-3/5 border-r border-gray-700 bg-gray-900">
          <BlocklyWorkspace onWorkspaceChange={handleWorkspaceChange} />
        </div>

        {/* Right Panel */}
        <div className="flex-grow-[2] w-2/5 flex flex-col">
          {/* Right Top: Monaco Code Preview */}
          <div className="flex-1 border-b border-gray-700 bg-gray-800">
            <CairoEditor code={cairoCode} />
          </div>

          {/* Right Bottom: Tabbed Panel */}
          <div className="flex-1 bg-gray-800">
            <div className="flex border-b border-gray-700">
              <button className="px-4 py-2 text-blue-400 border-b-2 border-blue-400">Test</button>
              <button className="px-4 py-2 text-gray-400 hover:text-white">AI</button>
              <button className="px-4 py-2 text-gray-400 hover:text-white">Deploy</button>
            </div>
            <div className="h-full w-full flex items-center justify-center text-gray-500 p-4">
              {errors.length > 0 && (
                <div className="text-red-400 text-sm overflow-auto h-full w-full p-2 bg-gray-900 rounded-md">
                  <h3 className="font-bold mb-2">Validation Issues:</h3>
                  {errors.map((err, index) => (
                    <p key={index} className={err.severity === 'error' ? 'text-red-500' : 'text-yellow-500'}>
                      [{err.severity.toUpperCase()}] Block ID: {err.blockId} - {err.message}
                    </p>
                  ))}
                </div>
              )}
              {errors.length === 0 && <p>No issues detected.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircuitEditor;

