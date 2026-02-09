import * as Blockly from 'blockly';

// Common color for Output block
const OUTPUT_BLOCK_COLOR = '#FF9800'; // Orange

// cairo_public_output
Blockly.Blocks['cairo_public_output'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('Output')
        .appendField(new Blockly.FieldTextInput('result'), 'NAME')
        .appendField('=');
    this.appendValueInput('VALUE')
        .setCheck('FieldElement');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(OUTPUT_BLOCK_COLOR);
    this.setTooltip('Defines a public output for the circuit');
    this.setHelpUrl('');
  }
};
