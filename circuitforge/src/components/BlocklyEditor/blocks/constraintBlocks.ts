import * as Blockly from 'blockly';

const CONSTRAINT_BLOCK_STYLE = 'constraint_blocks';

// cairo_assert_equal
Blockly.Blocks['cairo_assert_equal'] = {
  init: function() {
    this.appendValueInput('LEFT')
        .setCheck('FieldElement')
        .appendField('Assert');
    this.appendDummyInput()
        .appendField('==');
    this.appendValueInput('RIGHT')
        .setCheck('FieldElement');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle(CONSTRAINT_BLOCK_STYLE);
    this.setTooltip('Assert that two field elements are equal');
    this.setHelpUrl('');
  }
};

// cairo_assert_range
Blockly.Blocks['cairo_assert_range'] = {
  init: function() {
    this.appendValueInput('MIN')
        .setCheck('FieldElement')
        .appendField('Assert');
    this.appendDummyInput()
        .appendField('≤');
    this.appendValueInput('VALUE')
        .setCheck('FieldElement');
    this.appendDummyInput()
        .appendField('≤');
    this.appendValueInput('MAX')
        .setCheck('FieldElement');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle(CONSTRAINT_BLOCK_STYLE);
    this.setTooltip('Assert that a value is within a given range (min <= value <= max)');
    this.setHelpUrl('');
  }
};

// cairo_assert_not_zero
Blockly.Blocks['cairo_assert_not_zero'] = {
  init: function() {
    this.appendValueInput('VALUE')
        .setCheck('FieldElement')
        .appendField('Assert');
    this.appendDummyInput()
        .appendField('≠ 0');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle(CONSTRAINT_BLOCK_STYLE);
    this.setTooltip('Assert that a field element is not zero');
    this.setHelpUrl('');
  }
};

// cairo_compare_gt
Blockly.Blocks['cairo_compare_gt'] = {
  init: function() {
    this.appendValueInput('LEFT')
        .setCheck('FieldElement')
        .appendField('Assert');
    this.appendDummyInput()
        .appendField('>');
    this.appendValueInput('RIGHT')
        .setCheck('FieldElement');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle(CONSTRAINT_BLOCK_STYLE);
    this.setTooltip('Assert that left value is strictly greater than right value');
    this.setHelpUrl('');
  }
};
