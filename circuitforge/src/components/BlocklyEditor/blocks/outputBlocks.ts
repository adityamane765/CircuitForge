import * as Blockly from 'blockly';

const OUTPUT_BLOCK_STYLE = 'output_blocks';

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
    this.setStyle(OUTPUT_BLOCK_STYLE);
    this.setTooltip('Defines a public output for the circuit');
    this.setHelpUrl('');
  }
};
