import * as Blockly from 'blockly';
import type { AppTheme } from '@/context/ThemeContext';

export function createBlocklyTheme(appTheme: AppTheme): Blockly.Theme {
  return Blockly.Theme.defineTheme(`circuitforge_${appTheme.name}`, {
    base: Blockly.Themes.Classic,
    blockStyles: {
      input_blocks: { colourPrimary: appTheme.blockInputColor },
      arithmetic_blocks: { colourPrimary: appTheme.blockArithmeticColor },
      hash_blocks: { colourPrimary: appTheme.blockHashColor },
      logic_blocks: { colourPrimary: appTheme.blockLogicColor },
      constraint_blocks: { colourPrimary: appTheme.blockConstraintColor },
      output_blocks: { colourPrimary: appTheme.blockOutputColor },
    },
    categoryStyles: {
      input_category: { colour: appTheme.blockInputColor },
      arithmetic_category: { colour: appTheme.blockArithmeticColor },
      hash_category: { colour: appTheme.blockHashColor },
      logic_category: { colour: appTheme.blockLogicColor },
      constraint_category: { colour: appTheme.blockConstraintColor },
      output_category: { colour: appTheme.blockOutputColor },
    },
    componentStyles: {
      workspaceBackgroundColour: appTheme.blocklyWorkspaceBg,
      toolboxBackgroundColour: appTheme.blocklyToolboxBg,
      toolboxForegroundColour: appTheme.blocklyToolboxFg,
      flyoutBackgroundColour: appTheme.blocklyFlyoutBg,
      flyoutForegroundColour: appTheme.blocklyToolboxFg,
      flyoutOpacity: 0.95,
      scrollbarColour: appTheme.border,
      scrollbarOpacity: 0.7,
      insertionMarkerColour: appTheme.text,
      insertionMarkerOpacity: 0.3,
    },
    fontStyle: {
      family: 'monospace',
      size: 12,
    },
  } as any);
}
