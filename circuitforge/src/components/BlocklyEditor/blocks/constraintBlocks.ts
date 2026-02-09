import * as Blockly from 'blockly';

// Common color for Constraint blocks
const CONSTRAINT_BLOCK_COLOR = '#F44336'; // Red

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
    this.setColour(CONSTRAINT_BLOCK_COLOR);
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
    this.setColour(CONSTRAINT_BLOCK_COLOR);
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
    this.setColour(CONSTRAINT_BLOCK_COLOR);
    this.setTooltip('Assert that a field element is not zero');
    this.setHelpUrl('');
  }
};
