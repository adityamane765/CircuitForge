import * as Blockly from 'blockly';

const LOGIC_BLOCK_STYLE = 'logic_blocks';

// cairo_bitwise_and
Blockly.Blocks['cairo_bitwise_and'] = {
  init: function() {
    this.appendValueInput('LEFT')
        .setCheck('FieldElement');
    this.appendDummyInput()
        .appendField('AND');
    this.appendValueInput('RIGHT')
        .setCheck('FieldElement');
    this.setInputsInline(true);
    this.setOutput(true, 'FieldElement');
    this.setStyle(LOGIC_BLOCK_STYLE);
    this.setTooltip('Bitwise AND of two field elements');
    this.setHelpUrl('');
  }
};

// cairo_bitwise_or
Blockly.Blocks['cairo_bitwise_or'] = {
  init: function() {
    this.appendValueInput('LEFT')
        .setCheck('FieldElement');
    this.appendDummyInput()
        .appendField('OR');
    this.appendValueInput('RIGHT')
        .setCheck('FieldElement');
    this.setInputsInline(true);
    this.setOutput(true, 'FieldElement');
    this.setStyle(LOGIC_BLOCK_STYLE);
    this.setTooltip('Bitwise OR of two field elements');
    this.setHelpUrl('');
  }
};

// cairo_bitwise_xor
Blockly.Blocks['cairo_bitwise_xor'] = {
  init: function() {
    this.appendValueInput('LEFT')
        .setCheck('FieldElement');
    this.appendDummyInput()
        .appendField('XOR');
    this.appendValueInput('RIGHT')
        .setCheck('FieldElement');
    this.setInputsInline(true);
    this.setOutput(true, 'FieldElement');
    this.setStyle(LOGIC_BLOCK_STYLE);
    this.setTooltip('Bitwise XOR of two field elements');
    this.setHelpUrl('');
  }
};

// cairo_bitwise_not
Blockly.Blocks['cairo_bitwise_not'] = {
  init: function() {
    this.appendValueInput('VALUE')
        .setCheck('FieldElement')
        .appendField('NOT');
    this.setInputsInline(true);
    this.setOutput(true, 'FieldElement');
    this.setStyle(LOGIC_BLOCK_STYLE);
    this.setTooltip('Bitwise NOT (complement) of a field element');
    this.setHelpUrl('');
  }
};