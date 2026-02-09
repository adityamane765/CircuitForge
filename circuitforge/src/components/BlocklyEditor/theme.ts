import * as Blockly from 'blockly';

export const circuitForgeDarkTheme = Blockly.Theme.defineTheme('circuitforge_dark', {
  base: Blockly.Themes.Classic,
  componentStyles: {
    workspaceBackgroundColour: '#1e1e2e',
    toolboxBackgroundColour: '#2d2d3e',
    toolboxForegroundColour: '#ffffff',
    flyoutBackgroundColour: '#252535',
    flyoutForegroundColour: '#ccc',
    flyoutOpacity: 0.9,
    scrollbarColour: '#5e5e5e',
    scrollbarOpacity: 0.7,
    insertionMarkerColour: '#ffffff',
    insertionMarkerOpacity: 0.3,
  },
  fontStyle: {
    family: 'monospace',
    size: 12,
  },
} as any);
