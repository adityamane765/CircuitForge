# CircuitForge

CircuitForge is a visual editor for building Cairo constraint programs from typed blocks. Connect inputs, operations, hashes, and constraints on the canvas, then inspect the generated Cairo and test the graph in the browser.

Use the [developer guide](https://circuit-forge.vercel.app/developers) for the product walkthrough, block reference, workflows, troubleshooting, and current limitations.

## What you can do

- Start with an empty canvas, a built-in template, a browser save, or an IPFS circuit.
- Build with 19 typed blocks across inputs, arithmetic, hashing, logic, constraints, and outputs.
- Inspect generated Cairo as the graph changes.
- Enter circuit inputs and run constraint tests locally.
- Export a `.cairo` file or a complete Scarb project.
- Compile, declare, and deploy generated contracts to Starknet Sepolia.
- Review the current code with Claude, ChatGPT, or Gemini using your own API key.
- Publish circuits through Pinata and share them by CID.

## Run locally

Requirements:

- Node.js 20 or later
- npm

```bash
git clone https://github.com/adityamane765/CircuitForge.git
cd CircuitForge/circuitforge
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

The editor works locally without a wallet or deployer account. Contract declaration requires a funded Starknet Sepolia deployer:

```env
STARKNET_DEPLOYER_PRIVATE_KEY=0x...
STARKNET_DEPLOYER_ADDRESS=0x...
```

AI and Pinata credentials are entered in the application when those features are used.

## Useful commands

```bash
npm run dev      # Start the development server
npm test         # Run the test suite
npm run lint     # Run ESLint
npm run build    # Create a production build
```

## Current boundaries

- The built-in deployment flow targets Starknet Sepolia.
- Hosted compilation and class declaration require internet access.
- Browser saves remain in the current browser profile.
- Private inputs are tested locally, but generated contracts currently emit zero placeholders for them. Connect a proving or witness system in the exported project.
- Public Output blocks are emitted as comments rather than contract return values. Add the intended ABI behavior in the exported project.
- AI suggestions are not a cryptographic or security audit.

See the [developer guide](https://circuit-forge.vercel.app/developers#limitations) for details.
