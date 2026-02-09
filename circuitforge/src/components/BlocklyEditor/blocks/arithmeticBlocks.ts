import * as Blockly from 'blockly';

// Common color for Arithmetic blocks
const ARITHMETIC_BLOCK_COLOR = '#2196F3'; // Blue

// cairo_add
Blockly.Blocks['cairo_add'] = {
  init: function() {
    this.appendValueInput('LEFT')
        .setCheck('FieldElement');
    this.appendDummyInput()
        .appendField('+');
    this.appendValueInput('RIGHT')
        .setCheck('FieldElement');
    this.setInputsInline(true);
    this.setOutput(true, 'FieldElement');
    this.setColour(ARITHMETIC_BLOCK_COLOR);
    this.setTooltip('Add two field elements');
    this.setHelpUrl('');
  }
};

// cairo_sub
Blockly.Blocks['cairo_sub'] = {
  init: function() {
    this.appendValueInput('LEFT')
        .setCheck('FieldElement');
    this.appendDummyInput()
        .appendField('-');
    this.appendValueInput('RIGHT')
        .setCheck('FieldElement');
    this.setInputsInline(true);
    this.setOutput(true, 'FieldElement');
    this.setColour(ARITHMETIC_BLOCK_COLOR);
    this.setTooltip('Subtract two field elements');
    this.setHelpUrl('');
  }
};

// cairo_mul
Blockly.Blocks['cairo_mul'] = {
  init: function() {
    this.appendValueInput('LEFT')
        .setCheck('FieldElement');
    this.appendDummyInput()
        .appendField('×'); // Using multiplication sign
    this.appendValueInput('RIGHT')
        .setCheck('FieldElement');
    this.setInputsInline(true);
    this.setOutput(true, 'FieldElement');
    this.setColour(ARITHMETIC_BLOCK_COLOR);
    this.setTooltip('Multiply two field elements');
    this.setHelpUrl('');
  }
};

// cairo_div
Blockly.Blocks['cairo_div'] = {
  init: function() {
    this.appendValueInput('LEFT')
        .setCheck('FieldElement');
    this.appendDummyInput()
        .appendField('÷'); // Using division sign
    this.appendValueInput('RIGHT')
        .setCheck('FieldElement');
    this.setInputsInline(true);
    this.setOutput(true, 'FieldElement');
    this.setColour(ARITHMETIC_BLOCK_COLOR);
    this.setTooltip('Divide two field elements');
    this.setHelpUrl('');
  }
};
