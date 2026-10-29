export interface GuideSection {
  id: "overview" | "quickstart" | "features" | "workflows" | "example" | "blocks" | "troubleshooting" | "limitations";
  label: string;
}

export interface QuickstartStep {
  number: string;
  title: string;
  instruction: string;
}

export interface TemplateSummary {
  name: string;
  teaches: string;
}

export interface ExecutionBoundary {
  name: string;
  responsibilities: string;
  requirement: string;
}

export interface CapabilityGroup {
  title: string;
  items: string[];
}

export interface Workflow {
  id: "build" | "test" | "export" | "deploy" | "save" | "share";
  title: string;
  steps: string[];
  note?: string;
}

export interface ExampleStep {
  number: string;
  title: string;
  body: string;
}

export interface BlockItem {
  name: string;
  description: string;
}

export interface BlockCategory {
  name: string;
  accent: string;
  blocks: BlockItem[];
}

export type TroubleshootingCategory =
  | "validation"
  | "disabled-test"
  | "hash-mismatch"
  | "compiler"
  | "declaration"
  | "wallet"
  | "network-funds"
  | "deployment"
  | "browser-storage";

export interface TroubleshootingItem {
  category: TroubleshootingCategory;
  symptom: string;
  cause: string;
  action: string;
}

export interface Limitation {
  id: "testnet" | "hosted-compiler" | "gas-estimate" | "ai-review" | "browser-local" | "private-input-placeholder" | "public-output-comment";
  title: string;
  description: string;
}

export const guideSections: GuideSection[] = [
  { id: "overview", label: "Overview" },
  { id: "quickstart", label: "First circuit" },
  { id: "features", label: "Features" },
  { id: "workflows", label: "Workflows" },
  { id: "example", label: "Example" },
  { id: "blocks", label: "Block reference" },
  { id: "troubleshooting", label: "Troubleshooting" },
  { id: "limitations", label: "Limits" },
];

export const quickstartSteps: QuickstartStep[] = [
  { number: "01", title: "Choose a starting point", instruction: "Use the empty canvas, open a built-in template, restore a browser save, or load an IPFS circuit by CID." },
  { number: "02", title: "Build the graph", instruction: "Connect inputs, operations, hashes, and constraints. The Cairo preview updates after each valid change." },
  { number: "03", title: "Test the constraints", instruction: "Enter every input and run the test panel. Change a value and run it again to check the failure case." },
  { number: "04", title: "Continue with the circuit", instruction: "Save it in this browser, export Cairo or a Scarb project, publish it to IPFS, or open Deploy." },
];

export const templateSummaries: TemplateSummary[] = [
  { name: "Age Verification", teaches: "Private and public inputs, a range check, Poseidon hashing, and a public output marker." },
  { name: "Arithmetic Proof", teaches: "A multiplication constraint over private and public inputs." },
  { name: "Hash Preimage", teaches: "A Poseidon hash checked against a public expected value." },
  { name: "Merkle Proof", teaches: "A two-level Poseidon path checked against a public root." },
];

export const executionBoundaries: ExecutionBoundary[] = [
  { name: "In your browser", responsibilities: "Graph editing, Cairo generation, local constraint tests, saves, and downloads.", requirement: "No wallet required" },
  { name: "Hosted service", responsibilities: "Cairo compilation, class declaration, AI requests, and Pinata requests.", requirement: "Internet access" },
  { name: "Your Starknet wallet", responsibilities: "Approves the contract deployment transaction.", requirement: "Sepolia account and fees" },
  { name: "Exported project", responsibilities: "Cairo source and a Scarb manifest for local development.", requirement: "Scarb toolchain" },
];

export const capabilityGroups: CapabilityGroup[] = [
  {
    title: "Build",
    items: ["Start with an empty canvas or a template", "Add typed blocks and connect compatible sockets", "Pan, zoom, reconnect, or delete blocks"],
  },
  {
    title: "Inspect",
    items: ["See the generated Cairo update with the graph", "Check constraint count and relative gas complexity", "Fix incomplete connections before export"],
  },
  {
    title: "Test",
    items: ["Enter values for each circuit input", "Run constraints locally in the browser", "Compute Poseidon and Pedersen test hashes"],
  },
  {
    title: "Save and export",
    items: ["Save and load circuits in this browser", "Download a single .cairo file", "Download a complete Scarb project"],
  },
  {
    title: "Deploy",
    items: ["Compile with the hosted Cairo compiler", "Declare the class on Starknet Sepolia", "Approve the deployment transaction in your wallet"],
  },
  {
    title: "Review and share",
    items: ["Send the current code to Claude, ChatGPT, or Gemini with your API key", "Inspect nodes, edges, and data flow in Graph", "Publish with Pinata or load an IPFS circuit by CID"],
  },
];

export const workflows: Workflow[] = [
  {
    id: "build",
    title: "Build a circuit",
    steps: ["Start empty, choose a template, restore a browser save, or load a CID from Share.", "Add blocks from the toolbox and connect compatible sockets.", "Fix validation errors shown above the Cairo preview."],
  },
  {
    id: "test",
    title: "Test the constraints",
    steps: ["Open Test and enter a value for every input.", "Select Run Tests.", "Change one value and rerun the test to check the failure case."],
    note: "Tests run locally and do not need a wallet.",
  },
  {
    id: "export",
    title: "Export code",
    steps: ["Open Export in the top bar.", "Select Export .cairo for a single source file.", "Select Export Scarb for a project with a manifest and source tree."],
  },
  {
    id: "deploy",
    title: "Deploy to Sepolia",
    steps: ["Open Deploy and connect a Starknet wallet on Sepolia.", "Select Start Deployment. CircuitForge compiles the contract and declares its class.", "Approve the UDC deployment transaction in your wallet."],
    note: "The connected wallet pays only for the instance deployment. Class declaration uses the server deployer.",
  },
  {
    id: "save",
    title: "Save in the browser",
    steps: ["Select Save in the top bar and name the circuit.", "Select Load to restore it later.", "Export a copy before clearing browser data or changing profiles."],
  },
  {
    id: "share",
    title: "Share through IPFS",
    steps: ["Open Share and add your Pinata API key and secret in Settings.", "Name the circuit and select Publish to IPFS.", "Share the CID. Another developer can paste it into Load from IPFS."],
  },
];

export const exampleSteps: ExampleStep[] = [
  { number: "01", title: "Load the template", body: "Open Templates and select Hash Preimage Proof. It compares the Poseidon hash of a private value with a public expected hash." },
  { number: "02", title: "Enter test values", body: "Open Test and set secret to 42. Use #Hash Helper to compute Poseidon(42, 0), then paste the result into expected_hash." },
  { number: "03", title: "Test pass and fail cases", body: "Run the test with the matching hash and expect PASS. Change expected_hash, run it again, and expect FAIL." },
  { number: "04", title: "Inspect or export", body: "Check the generated assertion in the Cairo preview. Export the source file or Scarb project to continue locally." },
];

export const blockCategories: BlockCategory[] = [
  {
    name: "Inputs",
    accent: "#7c4dff",
    blocks: [
      { name: "Private Input", description: "Represents a witness value that is not exposed as a public input." },
      { name: "Public Input", description: "Represents a value supplied publicly when the circuit is verified." },
      { name: "Constant", description: "A fixed felt252 value embedded directly in the circuit." },
    ],
  },
  {
    name: "Arithmetic",
    accent: "#448aff",
    blocks: [
      { name: "Add", description: "Adds two connected field values." },
      { name: "Subtract", description: "Subtracts the right value from the left value." },
      { name: "Multiply", description: "Multiplies two connected field values." },
      { name: "Divide", description: "Divides one field value by another; the divisor must be non-zero." },
      { name: "Modulo", description: "Returns the remainder after division." },
    ],
  },
  {
    name: "Hashing",
    accent: "#00bfa5",
    blocks: [
      { name: "Poseidon Hash", description: "Hashes two felt252 values with the Starknet-friendly Poseidon hash." },
      { name: "Pedersen Hash", description: "Hashes two felt252 values using Starknet's Pedersen construction." },
    ],
  },
  {
    name: "Logic",
    accent: "#ffab40",
    blocks: [
      { name: "Bitwise AND", description: "Applies an AND operation to two integer values." },
      { name: "Bitwise OR", description: "Applies an OR operation to two integer values." },
      { name: "Bitwise XOR", description: "Applies an exclusive OR operation to two integer values." },
      { name: "Bitwise NOT", description: "Inverts the bits of one integer value." },
    ],
  },
  {
    name: "Constraints",
    accent: "#ff5252",
    blocks: [
      { name: "Assert Equal", description: "Requires two connected values to be equal." },
      { name: "Assert Range", description: "Requires a value to remain between configured bounds." },
      { name: "Assert Not Zero", description: "Rejects a witness when the connected value is zero." },
      { name: "Assert Greater Than", description: "Requires the left value to be greater than the right value." },
    ],
  },
  {
    name: "Output",
    accent: "#ffd740",
    blocks: [
      { name: "Public Output", description: "Marks a computed value in the generated source; the current generator emits it as an output comment rather than a contract return value." },
    ],
  },
];

export const troubleshootingItems: TroubleshootingItem[] = [
  { category: "validation", symptom: "Cairo says “Fix errors in your blocks”", cause: "A required socket is empty or the graph is incomplete.", action: "Check the highlighted blocks and connect every required socket. The preview updates automatically." },
  { category: "disabled-test", symptom: "Run Tests is disabled", cause: "At least one circuit input has no test value.", action: "Fill every field listed under Inputs; hexadecimal and decimal felt252 values are accepted." },
  { category: "hash-mismatch", symptom: "Hash Preimage returns FAIL", cause: "expected_hash was not computed from the same secret and zero constant.", action: "Open #Hash Helper, recompute Poseidon(secret, 0), and paste the result without changing the secret." },
  { category: "compiler", symptom: "Compilation fails or times out", cause: "The generated Cairo is invalid, or the hosted compiler is unavailable.", action: "Resolve editor validation errors and retry. Export the Scarb project to compile locally if the service remains unavailable." },
  { category: "declaration", symptom: "Declaration fails", cause: "The CircuitForge server deployer is unavailable, misconfigured, unfunded, or cannot reach the Sepolia RPC.", action: "Retry once, then report the error. Your connected wallet does not pay for this server-owned stage." },
  { category: "wallet", symptom: "No wallet appears", cause: "A supported Starknet wallet is not installed, unlocked, or permitted for this site.", action: "Install or unlock Argent or Braavos, reload the editor, and reconnect from the Deploy tab." },
  { category: "network-funds", symptom: "The wallet rejects deployment", cause: "The account is not on Starknet Sepolia or has insufficient test STRK for fees.", action: "Switch the wallet to Sepolia and fund the account before retrying." },
  { category: "deployment", symptom: "Declare succeeds but deploy fails", cause: "The server created the class, but the wallet transaction was rejected or did not confirm.", action: "Read the wallet error, confirm the Sepolia account and fee balance, then retry the deployment step." },
  { category: "browser-storage", symptom: "A saved circuit or download is missing", cause: "Saved circuits live in this browser, and downloads can be blocked by browser settings.", action: "Use the same browser profile, allow downloads for the site, and export a Scarb project as a portable backup." },
];

export const limitations: Limitation[] = [
  { id: "testnet", title: "Sepolia only", description: "The built-in deployment flow targets Starknet Sepolia. Generated contracts are not ready for production without review and hardening." },
  { id: "hosted-compiler", title: "Hosted compilation", description: "One-click compilation depends on Nethermind's hosted Cairo compiler service and may be unavailable independently of the editor." },
  { id: "gas-estimate", title: "Estimated gas", description: "The editor estimates relative circuit cost from block types; it is not a transaction fee quote." },
  { id: "ai-review", title: "AI is not an audit", description: "Assistant suggestions can help explain or debug a circuit, but they are not a cryptographic or security review." },
  { id: "browser-local", title: "Browser-local saves", description: "Save and load use local browser storage. Export important circuits if you need a portable or durable copy." },
  { id: "private-input-placeholder", title: "Private-input integration", description: "The Test tab evaluates private values locally. Generated contracts currently emit private inputs as zero placeholders, so you must connect your proving or witness system in the exported project." },
  { id: "public-output-comment", title: "Output integration", description: "Public Output blocks are currently emitted as comments in generated Cairo, not as contract return values. Wire the intended ABI behavior in your exported project." },
];
