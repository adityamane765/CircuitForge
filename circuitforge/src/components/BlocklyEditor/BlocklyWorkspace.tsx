"use client";

import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import { toolbox } from './toolbox';
import { circuitForgeDarkTheme } from './theme'; // Import the new theme
import { registerAllBlocks } from './blocks';

interface BlocklyWorkspaceProps {
  onWorkspaceChange: (workspace: Blockly.WorkspaceSvg) => void;
}

const BlocklyWorkspace: React.FC<BlocklyWorkspaceProps> = ({ onWorkspaceChange }) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const onChangeRef = useRef(onWorkspaceChange); // Create a ref for the callback

  useEffect(() => {
    onChangeRef.current = onWorkspaceChange; // Update the ref whenever onWorkspaceChange changes
  }, [onWorkspaceChange]);

  useEffect(() => {
    if (blocklyDiv.current && !workspaceRef.current) {
      registerAllBlocks(); // Ensure all blocks are registered

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
          colour: '#ccc',
          snap: true,
        },
        trashcan: true,
        theme: circuitForgeDarkTheme, // Use the imported theme
      }) as Blockly.WorkspaceSvg;

      workspaceRef.current = workspace;

      workspace.addChangeListener(() => onChangeRef.current(workspace)); // Use the ref here

      // Initial resize to fit parent
      const onResize = () => Blockly.svgResize(workspace);
      window.addEventListener('resize', onResize);
      onResize(); // Initial call

      return () => {
        window.removeEventListener('resize', onResize);
        workspace.dispose();
        workspaceRef.current = null;
      };
    }
  }, []); // Empty dependency array, as onChangeRef will handle the callback updates

  return (
    <div ref={blocklyDiv} className="h-full w-full">
      {/* Blockly will inject its SVG here */}
    </div>
  );
};

export default BlocklyWorkspace;
