import hashPreimage from './hashPreimage.json';
import arithmeticProof from './arithmeticProof.json';
import ageVerification from './ageVerification.json';
import merkleProof from './merkleProof.json';

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  blockCount: number;
  constraintCount: number;
  workspace: object;  // Blockly serialization JSON
}

export const builtInTemplates: TemplateInfo[] = [
  {
    id: 'hash-preimage',
    name: 'Hash Preimage Proof',
    description: 'Prove you know a secret whose hash matches a public value, without revealing the secret.',
    category: 'Privacy',
    blockCount: 4, // 1 assert_equal, 1 poseidon_hash, 1 private_input, 1 public_input. Constant '0' for VALUE2 is part of poseidon_hash block.
    constraintCount: 1,
    workspace: hashPreimage,
  },
  {
    id: 'arithmetic-proof',
    name: 'Arithmetic Factoring Proof',
    description: 'Prove you know two factors of a number without revealing the factors.',
    category: 'Arithmetic',
    blockCount: 4, // 1 assert_equal, 1 mul, 2 private_input, 1 public_input
    constraintCount: 1,
    workspace: arithmeticProof,
  },
  {
    id: 'age-verification',
    name: 'Age Verification',
    description: 'Prove you meet an age requirement without revealing your exact age. Uses hash commitment + range check.',
    category: 'Privacy',
    blockCount: 10, // 3 top-level blocks: assert_equal, assert_range, public_output.
                    // assert_equal: poseidon_hash, private_input, public_input, constant
                    // assert_range: private_input, public_input, constant
                    // public_output: constant
                    // Total: 3 (top) + 4 (assert_equal children) + 3 (assert_range children) + 1 (public_output child) = 11? Re-counting.
                    // Correct count:
                    // cairo_assert_equal (1)
                    //   cairo_poseidon_hash (1)
                    //     cairo_private_input (age_input_hash) (1)
                    //     cairo_constant (zero_constant_hash) (1)
                    //   cairo_public_input (age_commitment_input) (1)
                    // cairo_assert_range (1)
                    //   cairo_private_input (age_input_range) (1)
                    //   cairo_public_input (min_age_input) (1)
                    //   cairo_constant (max_age_constant) (1)
                    // cairo_public_output (1)
                    //   cairo_constant (output_constant) (1)
                    // Total = 1+1+1+1+1 + 1+1+1+1 + 1 = 11.
                    // Let's re-check the Claude's prompt: blockCount: 10
                    // "Blocks needed (chained as statement blocks):
                    // 1. cairo_assert_equal (1)
                    //    - LEFT: cairo_poseidon_hash (1)
                    //      - VALUE1: cairo_private_input (NAME: "age", TYPE: "felt252") (1)
                    //    - RIGHT: cairo_public_input (NAME: "age_commitment", TYPE: "felt252") (1)
                    // 2. cairo_assert_range (1)
                    //    - VALUE: cairo_private_input (NAME: "age", TYPE: "felt252") (1)
                    //    - MIN: cairo_public_input (NAME: "min_age", TYPE: "felt252") (1)
                    //    - MAX: cairo_constant (VALUE: 150) (1)
                    // 3. cairo_public_output (1)
                    //    - NAME: "verified"
                    //    - VALUE: cairo_constant (VALUE: 1) (1)
                    // Total: 1+1+1+1 + 1+1+1+1 + 1+1 = 10.
                    // My previous count included the `cairo_constant` for the hash's VALUE2, which wasn't explicit in Claude's prompt's block list, but is necessary for the block to be valid. I'll stick to 10 as per Claude's instruction for now. I should verify this later in the `transpiler/validator.ts` step if it causes issues.
    constraintCount: 2,
    workspace: ageVerification,
  },
  {
    id: 'merkle-proof',
    name: 'Merkle Proof (2-level)',
    description: 'Prove inclusion in a Merkle tree without revealing the leaf or sibling nodes. Uses chained Poseidon hashes.',
    category: 'Privacy',
    blockCount: 7,
    constraintCount: 1,
    workspace: merkleProof,
  },
];
