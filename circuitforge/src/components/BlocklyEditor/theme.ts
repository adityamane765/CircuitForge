import * as Blockly from 'blockly';
import type { AppTheme } from '@/context/ThemeContext';

// Generate secondary (shadow) and tertiary (border) colors from primary
function blockStyle(primary: string) {
  // Parse hex
  const r = parseInt(primary.slice(1, 3), 16);
  const g = parseInt(primary.slice(3, 5), 16);
  const b = parseInt(primary.slice(5, 7), 16);
  // Secondary: desaturated + lighter (for shadow blocks)
  const sr = Math.min(255, Math.round(r * 0.6 + 80));
  const sg = Math.min(255, Math.round(g * 0.6 + 80));
  const sb = Math.min(255, Math.round(b * 0.6 + 80));
  // Tertiary: darker (for borders)
  const tr = Math.round(r * 0.65);
  const tg = Math.round(g * 0.65);
  const tb = Math.round(b * 0.65);
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return {
    colourPrimary: primary,
    colourSecondary: `#${toHex(sr)}${toHex(sg)}${toHex(sb)}`,
    colourTertiary: `#${toHex(tr)}${toHex(tg)}${toHex(tb)}`,
  };
}

export function createBlocklyTheme(appTheme: AppTheme): Blockly.Theme {
  return Blockly.Theme.defineTheme(`circuitforge_${appTheme.name}`, {
    base: Blockly.Themes.Classic,
    blockStyles: {
      input_blocks: blockStyle(appTheme.blockInputColor),
      arithmetic_blocks: blockStyle(appTheme.blockArithmeticColor),
      hash_blocks: blockStyle(appTheme.blockHashColor),
      logic_blocks: blockStyle(appTheme.blockLogicColor),
      constraint_blocks: blockStyle(appTheme.blockConstraintColor),
      output_blocks: blockStyle(appTheme.blockOutputColor),
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
