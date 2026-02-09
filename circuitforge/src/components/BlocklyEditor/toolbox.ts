export const toolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Inputs',
      colour: '#9C27B0', // Purple
      contents: [
        { kind: 'block', type: 'cairo_private_input' },
        { kind: 'block', type: 'cairo_public_input' },
        { kind: 'block', type: 'cairo_constant' },
      ],
    },
    {
      kind: 'category',
      name: 'Arithmetic',
      colour: '#2196F3', // Blue
      contents: [
        { kind: 'block', type: 'cairo_add' },
        { kind: 'block', type: 'cairo_sub' },
        { kind: 'block', type: 'cairo_mul' },
        { kind: 'block', type: 'cairo_div' },
      ],
    },
    {
      kind: 'category',
      name: 'Hashing',
      colour: '#4CAF50', // Green
      contents: [
        { kind: 'block', type: 'cairo_poseidon_hash' },
        { kind: 'block', type: 'cairo_pedersen_hash' },
      ],
    },
    {
      kind: 'category',
      name: 'Constraints',
      colour: '#F44336', // Red
      contents: [
        { kind: 'block', type: 'cairo_assert_equal' },
        { kind: 'block', type: 'cairo_assert_range' },
        { kind: 'block', type: 'cairo_assert_not_zero' },
      ],
    },
    {
      kind: 'category',
      name: 'Output',
      colour: '#FF9800', // Orange
      contents: [
        { kind: 'block', type: 'cairo_public_output' },
      ],
    },
  ],
};
