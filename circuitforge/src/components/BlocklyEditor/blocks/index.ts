import * as Blockly from 'blockly';

import './inputBlocks';
import './arithmeticBlocks';
import './hashBlocks';
import './constraintBlocks';
import './outputBlocks';
import './logicBlocks';

let registered = false;

export function registerAllBlocks() {
  if (registered) return;
  // All blocks are imported and registered when their files are imported.
  // This function can be called to ensure they are loaded, or simply
  // importing this file will have the same effect.
  console.log('All CircuitForge blocks registered with Blockly.');
  registered = true;
}
