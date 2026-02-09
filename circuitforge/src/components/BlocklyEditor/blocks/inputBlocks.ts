import * as Blockly from 'blockly';

// Common color for Input blocks
const INPUT_BLOCK_COLOR = '#9C27B0'; // Purple

// cairo_private_input
Blockly.Blocks['cairo_private_input'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🔒 Private')
        .appendField(new Blockly.FieldTextInput('secret'), 'NAME')
        .appendField('type')
        .appendField(new Blockly.FieldDropdown([
          ['felt252', 'felt252'],
          ['u32', 'u32'],
          ['u128', 'u128']
        ]), 'TYPE');
    this.setOutput(true, 'FieldElement');
    this.setColour(INPUT_BLOCK_COLOR);
    this.setTooltip('Private witness input — only known to the prover');
    this.setHelpUrl('');
  }
};

// cairo_public_input
Blockly.Blocks['cairo_public_input'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🌐 Public')
        .appendField(new Blockly.FieldTextInput('input'), 'NAME')
        .appendField('type')
        .appendField(new Blockly.FieldDropdown([
          ['felt252', 'felt252'],
          ['u32', 'u32'],
          ['u128', 'u128']
        ]), 'TYPE');
    this.setOutput(true, 'FieldElement');
    this.setColour(INPUT_BLOCK_COLOR);
    this.setTooltip('Public input — known to both prover and verifier');
    this.setHelpUrl('');
  }
};

// cairo_constant
Blockly.Blocks['cairo_constant'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('📌 Constant')
        .appendField(new Blockly.FieldNumber(0), 'VALUE');
    this.setOutput(true, 'FieldElement');
    this.setColour(INPUT_BLOCK_COLOR);
    this.setTooltip('A constant field element value');
    this.setHelpUrl('');
  }
};
