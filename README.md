<div align="center">

# CircuitForge

**Visual ZK Circuit Builder for Starknet**

*Drag. Connect. Prove. Deploy.*

[![Built for Re{define} Hackathon](https://img.shields.io/badge/Re%7Bdefine%7D-Privacy%20Track-8b5cf6?style=for-the-badge)](https://redefined.xyz)
[![Starknet](https://img.shields.io/badge/Starknet-Sepolia-ec4899?style=for-the-badge)](https://starknet.io)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Cairo](https://img.shields.io/badge/Cairo-2.9.2-f97316?style=for-the-badge)](https://cairo-lang.org)

</div>

---

## What is CircuitForge?

CircuitForge is a **no-code ZK circuit IDE** that lets you build zero-knowledge proof circuits visually — no Cairo expertise required. Drag blocks onto a canvas, snap them together, and instantly see valid Cairo code generated in real time. Then compile, declare, and deploy to Starknet Sepolia in one click.

---

## Features

### Visual Circuit Editor
- **18 drag-and-drop blocks** across 6 categories — Inputs, Arithmetic, Hashing, Logic, Constraints, Outputs
- **Live Cairo preview** — Monaco editor updates as you build
- **Real-time validation** with inline error highlighting
- **Resizable split panel** — adjust workspace/code ratio

### Testing & Gas Estimation
- **Test Panel** — run your circuit with custom inputs and see pass/fail per constraint
- **Gas Estimator** — estimates step cost by block type (Poseidon: 500, Pedersen: 4000, arithmetic: 20–40 steps)

### Circuit Visualization
- **Dataflow DAG** — interactive graph showing how values flow between blocks
- Auto-layout with node positioning

### AI Assistant
- **Multi-provider chat** — Claude, ChatGPT, or Gemini
- Context-aware: the AI knows your available blocks and circuit patterns
- Chat state persists across tab switches

### Compile & Deploy
- **One-click compilation** via Nethermind's hosted Cairo compiler API (no local toolchain needed)
- **Wallet connect** via get-starknet (Argent, Braavos, etc.)
- **Declare + Deploy** to Starknet Sepolia with tx hash and contract address
- **Voyager links** for every transaction

### IPFS Marketplace
- **Publish circuits** to IPFS via Pinata
- **Browse by hash** — share circuits with a single CID
- Copy hash to clipboard

### Save, Load & Export
- **localStorage persistence** — your circuit is saved automatically
- **Export `.cairo`** — download generated source file
- **Export Scarb project** — full `.zip` with `Scarb.toml` for local development

### Pre-built templates
- Right now, we have 4 simple templates which users can load on one click to help users understand the setup.

| Template | Category | Description |
|---|---|---|
| Hash Preimage Proof | Privacy | Prove knowledge of secret whose hash matches public value |
| Arithmetic Factoring | Arithmetic | Prove two private factors of a public product |
| Age Verification | Privacy | Prove age threshold without revealing exact age |
| Merkle Proof (2-level) | Privacy | Prove leaf inclusion in a Merkle tree |

### Themes
4 editor themes: **Midnight**, **Monokai**, **Solarized**, **Light** — each with coordinated Blockly block colors and Monaco syntax highlighting.

### Onboarding
- Interactive **guided tour** walks new users through every part of the editor

---

## Block Reference

| Category | Blocks |
|---|---|
| **Inputs** | Private Input, Public Input, Constant |
| **Arithmetic** | Add, Subtract, Multiply, Divide, Modulo |
| **Hashing** | Poseidon Hash, Pedersen Hash |
| **Logic** | Bitwise AND, OR, XOR, NOT |
| **Constraints** | Assert Equal, Assert Range, Assert Not Zero, Assert Greater Than |
| **Output** | Public Output |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5, Cairo 2.9.2 |
| Visual Editor | Blockly.js v12 |
| Code Editor | Monaco Editor (`@monaco-editor/react`) |
| Styling | Tailwind CSS v4 |
| Blockchain | Starknet.js v9, get-starknet v4 |
| AI | Anthropic SDK, OpenAI SDK, Google Generative AI |
| Storage | Pinata (IPFS), localStorage |
| Compiler | Nethermind Remix API (hosted, free) |
| Export | JSZip |

---

## Architecture

```
circuitforge/src/
├── app/
│   ├── page.tsx                   # Landing page
│   ├── editor/page.tsx            # Main editor
│   └── api/
│       ├── chat/route.ts          # AI multi-provider proxy
│       ├── compile/route.ts       # Cairo compiler (Nethermind API)
│       └── pinata/route.ts        # IPFS publish/fetch
├── components/
│   ├── CircuitEditor.tsx          # Main orchestrator
│   ├── BlocklyEditor/             # Canvas, toolbox, block definitions
│   ├── CodePreview/               # Monaco Cairo editor
│   ├── TestPanel/                 # Circuit test runner
│   ├── AIAssistant/               # Chat panel
│   ├── DeployPanel/               # Wallet + deploy flow
│   ├── Marketplace/               # IPFS circuit sharing
│   ├── CircuitVisualization/      # Dataflow DAG
│   ├── TemplateGallery/           # Pre-built templates
│   ├── Landing/                   # Homepage
│   └── Onboarding/                # Guided tour
├── transpiler/
│   ├── types.ts                   # AST node interfaces
│   ├── parser.ts                  # Blockly → AST
│   ├── validator.ts               # AST validation
│   └── generator.ts               # AST → Cairo code
├── context/ThemeContext.tsx        # Global theme state
├── lib/
│   ├── gasEstimator.ts            # Step cost calculator
│   └── scarbExporter.ts           # ZIP project builder
└── templates/                     # Pre-built circuit JSON files
```

### Transpiler Pipeline

```
Blockly Workspace
      │
      ▼
   Parser          (Blockly blocks → CircuitAST)
      │
      ▼
  Validator        (type checks, missing connections)
      │
      ▼
  Generator        (AST → Cairo source code)
      │
      ▼
  Cairo Code       (displayed in Monaco, ready to compile)
```

---

## User Workflow

```
1. Design    →  Drag blocks, build circuit visually
2. Test      →  Fill inputs, verify constraints pass
3. Visualize →  See the dataflow graph
4. Chat      →  Ask AI for suggestions
5. Compile   →  Generate Sierra + CASM artifacts
6. Deploy    →  Connect wallet → Declare → Deploy to Sepolia
7. Share     →  Publish to IPFS, copy hash
8. Export    →  Download .cairo or full Scarb project
```

---

## Environment Variables

- Create an .env.local file using template from .env.example and update the keys in it
- AI provider keys are entered by the user in-app and never stored server-side.
---

### Local Development

```bash
git clone https://github.com/your-username/CircuitForge
cd CircuitForge/circuitforge
npm install
```

Create `.env.local`:
```env
STARKNET_DEPLOYER_PRIVATE_KEY=0x...
STARKNET_DEPLOYER_ADDRESS=0x...
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

---