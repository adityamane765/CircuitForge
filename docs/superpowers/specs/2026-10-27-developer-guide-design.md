# CircuitForge Developer Guide Design

## Intent

Create a concise, polished developer-facing guide that proves a new user can successfully use CircuitForge without live help. The guide is also a DevRel work sample for Aditya Mane's Saifuro application: it should demonstrate clear onboarding, technically accurate explanations, useful failure guidance, and a reproducible path from a template to a working circuit artifact.

## Audience

The only audience is developers using CircuitForge to visually build, test, export, and deploy Cairo circuits. Contributors, maintainers, API integrators, and people extending CircuitForge are out of scope.

## Primary Outcome

A developer unfamiliar with CircuitForge can open the guide, load the Hash Preimage template, understand the circuit's inputs and constraint, run one passing and one failing test, inspect the generated Cairo, and export the result. Deployment to Starknet Sepolia is documented as an optional final step because it requires a compatible wallet and testnet funds.

## Goals

- Make the first successful circuit test achievable in a few minutes.
- Explain the editor in the order a developer actually uses it.
- Use exact UI labels, real values, and real expected results from the current product.
- Explain the relationship between visual blocks, validation, generated Cairo, testing, export, and deployment.
- Include actionable troubleshooting for likely failures.
- Match CircuitForge's current dark, technical visual identity.
- Create a page strong enough to share as a standalone developer-writing sample.

## Non-goals

- Contributor or local-development setup.
- Internal application architecture or a Blockly/AST implementation deep dive.
- API reference, MCP server, SDK, or external integration documentation.
- A large documentation system, search, versioning, or changelog.
- Exhaustive coverage of every possible circuit.
- Claims that compilation or deployment succeeds without the required external services, wallet approval, or testnet funds.

## Experience and Information Architecture

### Navigation

Add a `Developers` link to the public landing-page navigation. It routes to `/developers`. Keep `Launch Editor` as the primary product action.

The developer page uses a lightweight sticky header with:

- CircuitForge home
- `How to use` as the active section
- `Block reference`
- `Troubleshooting`
- `Open editor` primary action

On mobile, these reduce to a compact header and in-page section navigation without introducing a large menu system.

### Page opening

Lead with the outcome rather than a feature pitch:

> Build and test your first ZK circuit.

Supporting copy states that the walkthrough starts from the Hash Preimage template, produces Cairo in real time, and can be completed in a few minutes before any wallet is needed.

Show two factual labels near the heading:

- No install required
- Wallet needed only for Sepolia deployment

Primary action: `Start the walkthrough` (scrolls to the first step).
Secondary action: `Open the editor`.

### Guided Hash Preimage walkthrough

The walkthrough is the core of the page and follows the real editor sequence:

1. Open the editor and select `Templates`.
2. Load the `Hash Preimage Proof` template.
3. Read the circuit: private `secret`, public `expected_hash`, Poseidon hash with a zero constant, and an equality constraint.
4. Use the Test tab's Hash Helper to compute the expected Poseidon hash for the chosen secret and zero.
5. Enter the secret and computed public hash, then run a passing test.
6. Change the public hash and run a failing test so the failure state is explicit.
7. Inspect the generated Cairo and relate its important lines to the visual blocks.
8. Export either a `.cairo` file or a complete Scarb project.

Each step includes the exact control name, a concise reason for the step, and the expected visible result. Values and outputs must be captured from a real run during implementation rather than invented in the document.

### Optional deployment section

After the no-wallet success path, provide an optional `Deploy to Starknet Sepolia` section:

- prerequisites: compatible Starknet wallet, Sepolia network, and test STRK for fees;
- open the Deploy tab;
- connect the wallet;
- start deployment;
- describe compile, declare, and deploy as separate visible stages;
- point to the returned transaction and contract links on Voyager.

Do not promise a duration until the workflow has been timed. State that wallet approval and testnet confirmation times vary.

### Block reference

Include a compact, scannable reference for the implemented toolbox categories and their 19 current blocks:

- Inputs: 3
- Arithmetic: 5
- Hashing: 2
- Logic: 4
- Constraints: 4
- Output: 1

The reference explains each block in one sentence, its input/output role, and any meaningful constraint or type behavior. Content should be derived from the implemented toolbox and block definitions so the landing-page and README counts can be corrected consistently.

### Troubleshooting

Include an actionable table with three columns: visible symptom, likely cause, next action. At minimum cover:

- Cairo preview says to fix block errors.
- A block input is disconnected.
- Test button is disabled because required inputs are empty.
- Hash Preimage test fails because the public hash does not match the private secret.
- Compilation service failure.
- No compatible Starknet wallet is detected.
- Wallet is on the wrong network or lacks Sepolia funds.
- Declaration or deployment transaction fails.
- Export/save behavior is blocked by browser settings.

Only document error messages and recovery steps confirmed against the current implementation.

### Boundaries and limitations

Close with a short, candid section:

- CircuitForge generates and tests supported circuit patterns; users remain responsible for reviewing generated code and security assumptions.
- Gas figures are estimates, not transaction quotes.
- Deployment targets Starknet Sepolia, not mainnet.
- Compilation depends on the configured hosted compiler service.
- AI assistance is optional and is not a security review.
- Browser save state is local to that browser.

## Visual Direction

Preserve the existing nearly-black surface, cyan accent, monospace technical details, and restrained glow. The page should feel like product documentation rather than a marketing landing page.

- Use a narrow reading column for explanations and a wider framed editor/screenshot area for concrete steps.
- Use numbered steps, small status labels, and real interface captures.
- Use cyan for actions and navigation, green for passing outcomes, and red only for failure examples.
- Avoid generic feature-card grids, decorative animations, and repeated marketing copy.
- Keep code and exact UI output selectable wherever practical; screenshots support the explanation but do not replace it.
- Respect reduced-motion preferences and maintain readable contrast and keyboard focus states.

## Product Changes

- Add `/developers` as a new public page.
- Add the `Developers` link to the landing-page navigation.
- Add direct in-guide links that open `/editor` at the appropriate moments.
- Correct inconsistent block-count copy in existing public content and README to match the 19 implemented blocks.
- Reuse existing styling conventions and avoid adding a new UI framework.

## Verification

- Run the Hash Preimage walkthrough against the actual deployed or local product and capture exact successful and failing states.
- Verify every named button, tab, and label against the current UI.
- Verify export for `.cairo` and Scarb project.
- Verify responsive rendering at desktop and mobile widths.
- Run the existing lint/build checks after implementation.
- Ask at least one developer unfamiliar with CircuitForge to follow the guide without verbal help; record only genuine stumbling points and revise the guide accordingly.

## Builder Calls

- The guide will be a custom page inside the existing Next.js app rather than a separate docs framework.
- Hash Preimage is the single flagship walkthrough because it demonstrates private/public inputs, hashing, a constraint, pass/fail testing, and generated Cairo without requiring a wallet.
- Deployment is secondary and optional so testnet friction does not block the first success.
- Screenshots and exact outputs will be gathered during implementation after the underlying flow is verified.

