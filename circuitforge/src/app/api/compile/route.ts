import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir, rm, readdir } from 'fs/promises';
import { execSync } from 'child_process';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { homedir } from 'os';
import { RpcProvider, Account, hash as starkHash } from 'starknet';

const SEPOLIA_RPC_URL = 'https://rpc.starknet-testnet.lava.build';

const SCARB_TOML_TEMPLATE = `
[package]
name = "circuit"
version = "0.1.0"
edition = "2024_07"

[dependencies]
starknet = "2.9.2"

[[target.starknet-contract]]
sierra = true
casm = true
`;

function findScarb(): string {
  // Check common install locations since Next.js server may not inherit shell PATH
  const candidates = [
    'scarb', // system PATH
    join(homedir(), '.local', 'bin', 'scarb'),
    join(homedir(), '.scarb', 'bin', 'scarb'),
    '/usr/local/bin/scarb',
  ];

  for (const candidate of candidates) {
    try {
      execSync(`${candidate} --version`, { stdio: 'pipe' });
      return candidate;
    } catch {
      // try next
    }
  }

  throw new Error(
    'Scarb is not installed. Install it with:\n' +
    'curl --proto \'=https\' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh\n' +
    'Then restart the dev server.'
  );
}

export async function POST(req: NextRequest) {
  const { cairoCode } = await req.json();
  const tmpDir = join('/tmp', `circuit-${randomUUID()}`);

  try {
    // 0. Find scarb binary
    const scarbBin = findScarb();

    // 1. Create temp Scarb project
    await mkdir(join(tmpDir, 'src'), { recursive: true });
    await writeFile(join(tmpDir, 'Scarb.toml'), SCARB_TOML_TEMPLATE);
    await writeFile(join(tmpDir, 'src', 'lib.cairo'), cairoCode);

    // 2. Compile
    execSync(`${scarbBin} build`, { cwd: tmpDir, timeout: 60000 });

    // 3. Read artifacts — find files by extension since name may vary
    const targetDir = join(tmpDir, 'target', 'dev');
    const files = await readdir(targetDir);
    const sierraFile = files.find(f => f.endsWith('.contract_class.json'));
    const casmFile = files.find(f => f.endsWith('.compiled_contract_class.json'));

    if (!sierraFile || !casmFile) {
      throw new Error('Compilation succeeded but artifacts not found');
    }

    const sierra = await readFile(join(targetDir, sierraFile), 'utf-8');
    const casm = await readFile(join(targetDir, casmFile), 'utf-8');

    return NextResponse.json({ success: true, sierra, casm });
  } catch (error: any) {
    console.error("Scarb compilation or artifact reading failed:", error);
    // execSync errors include stderr with actual compiler output
    const stderr = error.stderr ? error.stderr.toString().trim() : '';
    const errorMsg = stderr || error.message || 'Compilation failed';
    return NextResponse.json(
      { success: false, errors: [errorMsg] },
      { status: 400 }
    );
  } finally {
    // Clean up temporary directory
    await rm(tmpDir, { recursive: true, force: true });
  }
}

// PUT: Declare a compiled contract on Starknet Sepolia using a server-side deployer account
export async function PUT(req: NextRequest) {
  const { sierra, casm } = await req.json();

  try {
    const deployerKey = process.env.STARKNET_DEPLOYER_PRIVATE_KEY;
    const deployerAddress = process.env.STARKNET_DEPLOYER_ADDRESS;

    if (!deployerKey || !deployerAddress) {
      throw new Error(
        'Server-side deployer not configured. Set STARKNET_DEPLOYER_PRIVATE_KEY and STARKNET_DEPLOYER_ADDRESS in .env.local'
      );
    }

    const provider = new RpcProvider({ nodeUrl: SEPOLIA_RPC_URL });
    const account = new Account({ provider, address: deployerAddress, signer: deployerKey });

    const sierraObj = JSON.parse(sierra);
    const casmObj = JSON.parse(casm);

    // Check if already declared (skip if so)
    const classHash = starkHash.computeContractClassHash(sierraObj);
    try {
      await provider.getClassByHash(classHash);
      // Already declared
      return NextResponse.json({ success: true, classHash, alreadyDeclared: true });
    } catch {
      // Not declared yet, proceed
    }

    const declareResponse = await account.declare({
      contract: sierraObj,
      casm: casmObj,
    });

    await provider.waitForTransaction(declareResponse.transaction_hash, { retryInterval: 2000 });

    return NextResponse.json({
      success: true,
      classHash: declareResponse.class_hash,
      transactionHash: declareResponse.transaction_hash,
    });
  } catch (error: any) {
    console.error('Declaration failed:', error);
    return NextResponse.json(
      { success: false, errors: [error.message || 'Declaration failed'] },
      { status: 400 }
    );
  }
}
