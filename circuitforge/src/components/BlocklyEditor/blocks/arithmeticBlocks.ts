import * as Blockly from 'blockly';

const ARITHMETIC_BLOCK_STYLE = 'arithmetic_blocks';

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
    this.setStyle(ARITHMETIC_BLOCK_STYLE);
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
    this.setStyle(ARITHMETIC_BLOCK_STYLE);
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
    this.setStyle(ARITHMETIC_BLOCK_STYLE);
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
    this.setStyle(ARITHMETIC_BLOCK_STYLE);
    this.setTooltip('Divide two field elements');
    this.setHelpUrl('');
  }
};

// cairo_modulo
Blockly.Blocks['cairo_modulo'] = {
  init: function() {
    this.appendValueInput('LEFT')
        .setCheck('FieldElement');
    this.appendDummyInput()
        .appendField('%');
    this.appendValueInput('RIGHT')
        .setCheck('FieldElement');
    this.setInputsInline(true);
    this.setOutput(true, 'FieldElement');
    this.setStyle(ARITHMETIC_BLOCK_STYLE);
    this.setTooltip('Modulo: remainder of left divided by right');
    this.setHelpUrl('');
  }
};
