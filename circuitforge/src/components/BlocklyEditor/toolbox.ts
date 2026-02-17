export const toolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Inputs',
      categoryStyle: 'input_category',
      contents: [
        { kind: 'block', type: 'cairo_private_input' },
        { kind: 'block', type: 'cairo_public_input' },
        { kind: 'block', type: 'cairo_constant' },
      ],
    },
    {
      kind: 'category',
      name: 'Arithmetic',
      categoryStyle: 'arithmetic_category',
      contents: [
        { kind: 'block', type: 'cairo_add' },
        { kind: 'block', type: 'cairo_sub' },
        { kind: 'block', type: 'cairo_mul' },
        { kind: 'block', type: 'cairo_div' },
        { kind: 'block', type: 'cairo_modulo' },
      ],
    },
    {
      kind: 'category',
      name: 'Hashing',
      categoryStyle: 'hash_category',
      contents: [
        { kind: 'block', type: 'cairo_poseidon_hash' },
        { kind: 'block', type: 'cairo_pedersen_hash' },
      ],
    },
    {
      kind: 'category',
      name: 'Logic',
      categoryStyle: 'logic_category',
      contents: [
        { kind: 'block', type: 'cairo_bitwise_and' },
        { kind: 'block', type: 'cairo_bitwise_or' },
        { kind: 'block', type: 'cairo_bitwise_xor' },
        { kind: 'block', type: 'cairo_bitwise_not' },
      ],
    },
    {
      kind: 'category',
      name: 'Constraints',
      categoryStyle: 'constraint_category',
      contents: [
        { kind: 'block', type: 'cairo_assert_equal' },
        { kind: 'block', type: 'cairo_assert_range' },
        { kind: 'block', type: 'cairo_assert_not_zero' },
        { kind: 'block', type: 'cairo_compare_gt' },
      ],
    },
    {
      kind: 'category',
      name: 'Output',
      categoryStyle: 'output_category',
      contents: [
        { kind: 'block', type: 'cairo_public_output' },
      ],
    },
  ],
};
