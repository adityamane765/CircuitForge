import * as Blockly from 'blockly';

// Common color for Hash blocks
const HASH_BLOCK_COLOR = '#4CAF50'; // Green

// cairo_poseidon_hash
Blockly.Blocks['cairo_poseidon_hash'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('Poseidon Hash');
    this.appendValueInput('VALUE1')
        .setCheck('FieldElement')
        .appendField('value 1');
    this.appendValueInput('VALUE2')
        .setCheck('FieldElement')
        .appendField('value 2');
    this.setOutput(true, 'FieldElement');
    this.setColour(HASH_BLOCK_COLOR);
    this.setTooltip('Compute Poseidon hash of two field elements');
    this.setHelpUrl('');
  }
};

// cairo_pedersen_hash
Blockly.Blocks['cairo_pedersen_hash'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('Pedersen Hash');
    this.appendValueInput('LEFT') // Renamed to LEFT/RIGHT for consistency with collab.md, though VALUE1/VALUE2 is more descriptive
        .setCheck('FieldElement')
        .appendField('value 1');
    this.appendValueInput('RIGHT')
        .setCheck('FieldElement')
        .appendField('value 2');
    this.setOutput(true, 'FieldElement');
    this.setColour(HASH_BLOCK_COLOR);
    this.setTooltip('Compute Pedersen hash of two field elements');
    this.setHelpUrl('');
  }
};
