"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import * as Blockly from 'blockly';

// Transpiler imports
import { parseWorkspace } from '@/transpiler/parser';
import { validateCircuit } from '@/transpiler/validator';
import { generateCairo } from '@/transpiler/generator';
import { CircuitAST, ValidationError } from '@/transpiler/types';

// UI Components
import BlocklyWorkspace from './BlocklyEditor/BlocklyWorkspace';
import CairoEditor from './CodePreview/CairoEditor';
import TemplateGallery from './TemplateGallery/TemplateGallery';
import TestPanel from './TestPanel/TestPanel';
import ChatPanel from './AIAssistant/ChatPanel';
import { estimateGas, GasEstimate } from '@/lib/gasEstimator';
import DeployPanel from './DeployPanel/DeployPanel';
import MarketplacePanel from './Marketplace/MarketplacePanel';
import { useTheme } from '@/context/ThemeContext';
import { exportScarbProject } from '@/lib/scarbExporter';
import CircuitDAG from './CircuitVisualization/CircuitDAG';
import TourOverlay from './Onboarding/TourOverlay';

interface SavedCircuitInfo {
  name: string;
  savedAt: number;
  workspace: object;
}

const CircuitEditor: React.FC = () => {
  const { theme, themeName, setTheme, allThemes } = useTheme();
  const [cairoCode, setCairoCode] = useState<string>('// Drag and drop blocks to generate Cairo code!');
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [constraintCount, setConstraintCount] = useState<number>(0);
  const [ast, setAst] = useState<CircuitAST | null>(null);
  const [gasEstimate, setGasEstimate] = useState<GasEstimate | null>(null);

  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false); // New state for Load modal
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [activeTab, setActiveTab] = useState<'test' | 'ai' | 'deploy' | 'share' | 'visualize'>('test');

  // Resizable split state (percentage of right panel height for code editor)
  const [editorHeightPercent, setEditorHeightPercent] = useState(50);
  const isDraggingRef = useRef(false);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [exportMenuRef]);

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  // Drag handlers for resizable split
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !rightPanelRef.current) return;
      const rect = rightPanelRef.current.getBoundingClientRect();
      const offsetY = e.clientY - rect.top;
      const percent = (offsetY / rect.height) * 100;
      setEditorHeightPercent(Math.min(80, Math.max(20, percent)));
    };
    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleWorkspaceChange = useCallback((workspace: Blockly.WorkspaceSvg) => {
    // Update ref immediately so buttons can access it
    workspaceRef.current = workspace;

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      const currentAst = parseWorkspace(workspace);
      const validationErrors = validateCircuit(currentAst);
      const errorOnly = validationErrors.filter(e => e.severity === 'error');

      let generatedCode = '';
      let currentGasEstimate: GasEstimate | null = null;

      if (errorOnly.length === 0) {
        try {
          generatedCode = generateCairo(currentAst);
          currentGasEstimate = estimateGas(currentAst);
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

      const currentConstraintCount = currentAst.statements.filter(s =>
        s.type === 'assert_equal' || s.type === 'assert_range' || s.type === 'assert_not_zero' || s.type === 'assert_gt'
      ).length;

      setCairoCode(generatedCode);
      setErrors(validationErrors);
      setConstraintCount(currentConstraintCount);
      setAst(currentAst);
      setGasEstimate(currentGasEstimate);
    }, 200);
  }, []);

  const handleSelectTemplate = useCallback((workspaceJson: object) => {
    if (workspaceRef.current) {
      workspaceRef.current.clear();
      Blockly.serialization.workspaces.load(workspaceJson, workspaceRef.current);
      handleWorkspaceChange(workspaceRef.current);
    }
    setShowTemplateGallery(false);
  }, [handleWorkspaceChange]);

  // Save/Load/Export Handlers
  const handleSaveCircuit = useCallback(() => {
    if (!workspaceRef.current) return;
    const circuitName = window.prompt("Enter a name for your circuit:");
    if (circuitName) {
      const serializedWorkspace = Blockly.serialization.workspaces.save(workspaceRef.current);
      const savedCircuitsString = localStorage.getItem('circuitforge_circuits');
      const savedCircuits: { [key: string]: SavedCircuitInfo } = savedCircuitsString ? JSON.parse(savedCircuitsString) : {};

      savedCircuits[circuitName] = {
        name: circuitName,
        savedAt: Date.now(),
        workspace: serializedWorkspace,
      };
      localStorage.setItem('circuitforge_circuits', JSON.stringify(savedCircuits));
      alert(`Circuit "${circuitName}" saved!`);
    }
  }, []);

  const handleLoadCircuit = useCallback(() => {
    setShowLoadModal(true);
  }, []);

  const performLoadCircuit = useCallback((circuitName: string) => {
    if (!workspaceRef.current) return;
    const savedCircuitsString = localStorage.getItem('circuitforge_circuits');
    const savedCircuits: { [key: string]: SavedCircuitInfo } = savedCircuitsString ? JSON.parse(savedCircuitsString) : {};

    const circuitToLoad = savedCircuits[circuitName];
    if (circuitToLoad) {
      workspaceRef.current.clear();
      Blockly.serialization.workspaces.load(circuitToLoad.workspace, workspaceRef.current);
      handleWorkspaceChange(workspaceRef.current);
      alert(`Circuit "${circuitName}" loaded!`);
    } else {
      alert(`Circuit "${circuitName}" not found.`);
    }
    setShowLoadModal(false);
  }, [handleWorkspaceChange]);

  const handleClearWorkspace = useCallback(() => {
    if (!workspaceRef.current) return;
    if (!window.confirm('Clear all blocks from the workspace?')) return;
    workspaceRef.current.clear();
    handleWorkspaceChange(workspaceRef.current);
  }, [handleWorkspaceChange]);

  const handleExportCairo = useCallback(() => {
    if (!cairoCode || cairoCode.startsWith('// Error') || cairoCode.startsWith('// Fix errors')) {
      alert("Cannot export invalid or empty Cairo code.");
      return;
    }
    const blob = new Blob([cairoCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'circuit.cairo';
    document.body.appendChild(a); // Append to body to ensure it's in the DOM
    a.click();
    document.body.removeChild(a); // Clean up
    URL.revokeObjectURL(url);
  }, [cairoCode]);

  const handleExportScarb = useCallback(async () => {
    if (!cairoCode || cairoCode.startsWith('// Error') || cairoCode.startsWith('// Fix errors')) {
      alert("Cannot export invalid or empty Cairo code.");
      return;
    }
    const name = window.prompt("Enter a name for your Scarb project:", "circuit") || "circuit";
    const blob = await exportScarbProject(cairoCode, name);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [cairoCode]);

  const handleLoadFromMarketplace = useCallback((workspaceJson: object) => {
    if (workspaceRef.current) {
      workspaceRef.current.clear();
      Blockly.serialization.workspaces.load(workspaceJson, workspaceRef.current);
      handleWorkspaceChange(workspaceRef.current);
    }
  }, [handleWorkspaceChange]);

  const getWorkspaceJson = useCallback((): object | null => {
    if (!workspaceRef.current) return null;
    return Blockly.serialization.workspaces.save(workspaceRef.current);
  }, []);

  const getGasComplexityColor = (complexity: 'Low' | 'Medium' | 'High' | undefined) => {
    switch (complexity) {
      case 'Low': return theme.green;
      case 'Medium': return theme.yellow;
      case 'High': return theme.red;
      default: return theme.textMuted;
    }
  };

  // Load Modal Component (simple inline version)
  const LoadModal = () => {
    const savedCircuitsString = typeof window !== 'undefined' ? localStorage.getItem('circuitforge_circuits') : null;
    const savedCircuits: { [key: string]: SavedCircuitInfo } = savedCircuitsString ? JSON.parse(savedCircuitsString) : {};
    const circuitNames = Object.keys(savedCircuits);

    if (!showLoadModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
        <div className="relative w-full max-w-md rounded-lg p-6 shadow-xl" style={{ backgroundColor: theme.bgSecondary }}>
          <button
            className="absolute right-4 top-4 text-xl font-bold"
            style={{ color: theme.textMuted }}
            onClick={() => setShowLoadModal(false)}
          >
            &times;
          </button>
          <h2 className="mb-6 text-2xl font-bold" style={{ color: theme.text }}>Load Circuit</h2>

          {circuitNames.length === 0 ? (
            <p style={{ color: theme.textMuted }}>No saved circuits found.</p>
          ) : (
            <div className="flex flex-col space-y-3">
              {circuitNames.map((name) => (
                <button
                  key={name}
                  className="w-full rounded-md px-4 py-2 transition-colors"
                  style={{ backgroundColor: theme.btnBg, color: theme.btnText }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = theme.btnHover)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = theme.btnBg)}
                  onClick={() => performLoadCircuit(name)}
                >
                  {name} (Saved: {new Date(savedCircuits[name].savedAt).toLocaleDateString()})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const tabStyle = (tab: string) => ({
    color: activeTab === tab ? theme.textAccent : theme.textMuted,
    borderBottom: activeTab === tab ? `2px solid ${theme.textAccent}` : '2px solid transparent',
  });

  return (
    <div className="flex h-full w-full flex-col" style={{ backgroundColor: theme.bg, color: theme.text }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 shadow-md" style={{ backgroundColor: theme.headerBg }}>
        <Link href="/" className="text-xl font-bold no-underline" style={{ color: theme.textAccent, textDecoration: 'none' }}>CircuitForge</Link>
        <div className="flex items-center space-x-2" data-tour="header-actions">
          <button
            className="px-3 py-1.5 rounded-md text-sm transition-colors"
            style={{ backgroundColor: theme.btnBg, color: theme.btnText }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = theme.btnHover)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = theme.btnBg)}
            onClick={() => setShowTemplateGallery(true)}
            data-tour="templates-btn"
          >
            Templates
          </button>
          {[
            { label: 'Clear', handler: handleClearWorkspace },
            { label: 'Save', handler: handleSaveCircuit },
            { label: 'Load', handler: handleLoadCircuit },
          ].map(({ label, handler }) => (
            <button
              key={label}
              className="px-3 py-1.5 rounded-md text-sm transition-colors"
              style={{ backgroundColor: theme.btnBg, color: theme.btnText }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = theme.btnHover)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = theme.btnBg)}
              onClick={handler}
            >
              {label}
            </button>
          ))}

          <div className="relative" ref={exportMenuRef}>
            <button
              className="px-3 py-1.5 rounded-md text-sm transition-colors"
              style={{ backgroundColor: theme.btnBg, color: theme.btnText }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = theme.btnHover)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = theme.btnBg)}
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              Export
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg" style={{ backgroundColor: theme.bgSecondary, zIndex: 100 }}>
                <div className="py-1">
                  <button
                    className="block w-full px-4 py-2 text-left text-sm"
                    style={{ color: theme.text }}
                    onClick={() => {
                      handleExportCairo();
                      setShowExportMenu(false);
                    }}
                  >
                    Export .cairo
                  </button>
                  <button
                    className="block w-full px-4 py-2 text-left text-sm"
                    style={{ color: theme.text }}
                    onClick={() => {
                      handleExportScarb();
                      setShowExportMenu(false);
                    }}
                  >
                    Export Scarb
                  </button>
                </div>
              </div>
            )}
          </div>

          <span className="flex items-center space-x-2 text-sm px-2" style={{ color: theme.textMuted }}>
            <span>Constraints: {constraintCount}</span>
            {gasEstimate && (
              <span style={{ color: getGasComplexityColor(gasEstimate.complexity) }}>
                Gas: {gasEstimate.complexity}
              </span>
            )}
          </span>

          {/* Theme Selector */}
          <select
            value={themeName}
            onChange={e => setTheme(e.target.value as any)}
            className="px-2 py-1.5 rounded-md text-sm cursor-pointer border-none outline-none"
            style={{ backgroundColor: theme.btnBg, color: theme.btnText }}
          >
            {allThemes.map(t => (
              <option key={t.name} value={t.name}>{t.label}</option>
            ))}
          </select>
          <button
            className="px-3 py-1.5 rounded-md text-sm transition-colors"
            style={{ backgroundColor: theme.btnBg, color: theme.btnText }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = theme.btnHover)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = theme.btnBg)}
            onClick={() => setShowTour(true)}
            title="Show tutorial"
          >
            Guide
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Blockly Workspace */}
        <div className="grow-3 w-3/5" data-tour="workspace" style={{ borderRight: `1px solid ${theme.border}`, backgroundColor: theme.bg }}>
          <BlocklyWorkspace onWorkspaceChange={handleWorkspaceChange} />
        </div>

        {/* Right Panel */}
        <div ref={rightPanelRef} className="grow-2 w-2/5 flex flex-col">
          {/* Right Top: Monaco Code Preview */}
          <div className="overflow-hidden" data-tour="code-preview" style={{ height: `${editorHeightPercent}%`, backgroundColor: theme.bgSecondary }}>
            <CairoEditor code={cairoCode} />
          </div>

          {/* Drag Handle */}
          <div
            onMouseDown={handleDragStart}
            className="h-1.5 shrink-0 cursor-row-resize transition-colors"
            style={{ backgroundColor: theme.border }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = theme.accent)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = theme.border)}
          />

          {/* Right Bottom: Tabbed Panel */}
          <div className="flex-1 min-h-0 flex flex-col" data-tour="tab-panel" style={{ backgroundColor: theme.bgSecondary }}>
            <div className="flex shrink-0" style={{ borderBottom: `1px solid ${theme.border}` }}>
              {(['test', 'ai', 'deploy', 'share', 'visualize'] as const).map(tab => (
                <button
                  key={tab}
                  className="px-4 py-2 text-sm capitalize transition-colors"
                  style={tabStyle(tab)}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'ai' ? 'AI' : tab === 'visualize' ? 'Graph' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              {activeTab === 'test' && <TestPanel ast={ast} />}
              {activeTab === 'ai' && <ChatPanel />}
              {activeTab === 'deploy' && <DeployPanel cairoCode={cairoCode} />}
              {activeTab === 'share' && (
                <MarketplacePanel
                  cairoCode={cairoCode}
                  workspaceJson={getWorkspaceJson()}
                  onLoadCircuit={handleLoadFromMarketplace}
                />
              )}
              {activeTab === 'visualize' && <CircuitDAG ast={ast} />}
            </div>
          </div>
        </div>
      </div>

      <TemplateGallery
        isOpen={showTemplateGallery}
        onClose={() => setShowTemplateGallery(false)}
        onSelectTemplate={handleSelectTemplate}
      />
      <LoadModal />
      <TourOverlay
        forceShow={showTour}
        onComplete={() => setShowTour(false)}
      />
    </div>
  );
};

export default CircuitEditor;

