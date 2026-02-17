export interface TourStep {
  /** The data-tour attribute value to highlight */
  target: string;
  /** Short title for the tooltip */
  title: string;
  /** Description text */
  description: string;
  /** Which side of the target to show the tooltip */
  placement: 'top' | 'bottom' | 'left' | 'right';
}

export const tourSteps: TourStep[] = [
  {
    target: 'toolbox',
    title: 'Block Toolbox',
    description: 'Drag blocks from these categories onto the workspace. Start with Inputs, add Arithmetic or Hashing operations, then connect Constraints to build your circuit.',
    placement: 'right',
  },
  {
    target: 'workspace',
    title: 'Circuit Workspace',
    description: 'This is your canvas. Drag blocks here, snap them together to form circuits. Use scroll to zoom, and drag the background to pan.',
    placement: 'bottom',
  },
  {
    target: 'code-preview',
    title: 'Live Cairo Preview',
    description: 'Your circuit is transpiled to Cairo code in real-time. This read-only editor shows the generated code as you build.',
    placement: 'left',
  },
  {
    target: 'tab-panel',
    title: 'Feature Tabs',
    description: 'Test your circuit, chat with AI for help, deploy to Starknet, share on IPFS, or visualize the dataflow graph.',
    placement: 'left',
  },
  {
    target: 'templates-btn',
    title: 'Templates',
    description: 'Not sure where to start? Pick a pre-built template like Hash Preimage or Age Verification to see a working circuit instantly.',
    placement: 'bottom',
  },
  {
    target: 'header-actions',
    title: 'Save, Load & Export',
    description: 'Save your work to the browser, load previous circuits, or export as a .cairo file or full Scarb project.',
    placement: 'bottom',
  },
];
