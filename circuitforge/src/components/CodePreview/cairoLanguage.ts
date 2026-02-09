// This will be called with the monaco instance from @monaco-editor/react's beforeMount
export function registerCairoLanguage(monaco: any) {
  monaco.languages.register({ id: 'cairo' });

  monaco.languages.setMonarchTokensProvider('cairo', {
    keywords: [
      'fn', 'let', 'mut', 'const', 'use', 'mod', 'struct', 'enum', 'impl',
      'trait', 'if', 'else', 'match', 'loop', 'while', 'return', 'break',
      'continue', 'true', 'false', 'ref', 'self', 'extern', 'super', 'core', 'debug',
      // Common Cairo-specific keywords
      'nondet', 'syscall', 'gas', 'pedersen', 'poseidon', 'assert',
    ],
    typeKeywords: [
      'felt252', 'u8', 'u16', 'u32', 'u64', 'u128', 'u256', 'bool',
      'Array', 'Span', 'Option', 'Range', 'Box', 'NonZero', 'Tuple',
      'StorageAddress', 'ContractAddress', 'ClassHash', 'EthAddress',
      'Snapshot',
    ],
    operators: [
      '=', '>', '<', '!', '~', '?', ':',
      '==', '<=', '>=', '!=', '&&', '||',
      '+', '-', '*', '/', '&', '|', '^', '%',
      '+=', '-=', '*=', '/=', '->',
    ],
    symbols: /[=><!~?:&|+\-*/^%]+/,
    escapes: /\\(?:[nrt"]|u{[0-9A-Fa-f]{1,6}})/,
    digits: /\d+(_+\d+)*/,
    octaldigits: /[0-7]+(_+[0-7]+)*/,
    hexdigits: /[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,

    tokenizer: {
      root: [
        // Identifiers and keywords
        [/[a-zA-Z_]\w*/, {
          cases: {
            '@keywords': 'keyword',
            '@typeKeywords': 'type',
            '@default': 'identifier',
          },
        }],

        // Whitespace
        { include: '@whitespace' },

        // Delimiters
        [/[{}()\[\]]/, '@brackets'],
        [/[,;.]/, 'delimiter'],

        // Operators
        [/@symbols/, { cases: { '@operators': 'operator', '@default': '' } }],

        // Numbers
        [/(@digits)[eE]([-+]?(@digits))?[fFdD]?/, 'number.float'],
        [/(@digits)\.(@digits)([eE][-+]?(@digits))?[fFdD]?/, 'number.float'],
        [/0[xX](@hexdigits)/, 'number.hex'],
        [/0[oO](@octaldigits)/, 'number.octal'],
        [/0[bB][01]+(_+[01]+)*/, 'number.binary'],
        [/(@digits)/, 'number'],

        // Strings
        [/"([^"\\]|\\.)*$/, 'string.invalid'], // non-teminated string
        [/"/, 'string', '@string'],

        // Chars
        [/'[^']'/, 'string'],
        [/(')(@escapes)(')/, 'string'],
        [/'/, 'string.invalid'],
      ],

      whitespace: [
        [/[\s]+/, 'white'],
        [/\/\*(?!\/)/, 'comment', '@comment'],
        [/\/\/.*$/, 'comment'],
      ],

      comment: [
        [/[^/*]+/, 'comment'],
        [/\/\*/, 'comment', '@push'],
        [/\*\//, 'comment', '@pop'],
        [/[/*]/, 'comment'],
      ],

      string: [
        [/[^"\\]+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\./, 'string.escape.invalid'],
        [/"/, 'string', '@pop'],
      ],
    },
  } as any); // Cast to any to bypass potential type issues with Monaco's API
}
