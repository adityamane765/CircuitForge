"use client";

import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import { toolbox } from './toolbox';
import { createBlocklyTheme } from './theme';
import { registerAllBlocks } from './blocks';
import { useTheme } from '@/context/ThemeContext';

interface BlocklyWorkspaceProps {
  onWorkspaceChange: (workspace: Blockly.WorkspaceSvg) => void;
}

const BlocklyWorkspace: React.FC<BlocklyWorkspaceProps> = ({ onWorkspaceChange }) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const onChangeRef = useRef(onWorkspaceChange);
  const { theme } = useTheme();

  useEffect(() => {
    onChangeRef.current = onWorkspaceChange;
  }, [onWorkspaceChange]);

  // Create and apply Blockly theme whenever app theme changes
  useEffect(() => {
    if (workspaceRef.current) {
      const blocklyTheme = createBlocklyTheme(theme);
      workspaceRef.current.setTheme(blocklyTheme);
    }
  }, [theme]);

  useEffect(() => {
    if (blocklyDiv.current && !workspaceRef.current) {
      registerAllBlocks();

      const blocklyTheme = createBlocklyTheme(theme);

      const workspace = Blockly.inject(blocklyDiv.current, {
        toolbox: toolbox,
        horizontalLayout: false,
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2,
        },
        grid: {
          spacing: 20,
          length: 3,
          colour: theme.blocklyGridColor,
          snap: true,
        },
        trashcan: true,
        theme: blocklyTheme,
      }) as Blockly.WorkspaceSvg;

      workspaceRef.current = workspace;

      // Tag the toolbox for the onboarding tour
      const toolboxEl = blocklyDiv.current.querySelector('.blocklyToolboxDiv');
      if (toolboxEl) {
        toolboxEl.setAttribute('data-tour', 'toolbox');
      }

      workspace.addChangeListener(() => onChangeRef.current(workspace));

      const onResize = () => Blockly.svgResize(workspace);
      window.addEventListener('resize', onResize);
      onResize();

      return () => {
        window.removeEventListener('resize', onResize);
        workspace.dispose();
        workspaceRef.current = null;
      };
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={blocklyDiv} className="h-full w-full">
      {/* Blockly will inject its SVG here */}
    </div>
  );
};

export default BlocklyWorkspace;
