import { NextRequest, NextResponse } from 'next/server';
import { RpcProvider, Account, hash as starkHash } from 'starknet';

const SEPOLIA_RPC_URL = 'https://rpc.starknet-testnet.lava.build';
const REMIX_API = 'https://cairo-remix-api.nethermind.io';

const SCARB_TOML = `[package]
name = "circuit"
version = "0.1.0"
edition = "2024_07"

[dependencies]
starknet = "2.9.2"

[[target.starknet-contract]]
sierra = true
casm = true
`;

// POST: Compile Cairo code using Nethermind's hosted Remix compiler API (no Scarb needed)
export async function POST(req: NextRequest) {
  let cairoCode: string;
  try {
    ({ cairoCode } = await req.json());
  } catch {
    return NextResponse.json({ success: false, errors: ['Invalid request body'] }, { status: 400 });
  }

  try {
    // 1. Submit JSON compilation request
    const submitRes = await fetch(`${REMIX_API}/compile-async`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        files: [
          { file_name: 'Scarb.toml', file_content: SCARB_TOML },
          { file_name: 'src/lib.cairo', file_content: cairoCode },
        ],
        version: '2.9.2',
      }),
    });

    if (!submitRes.ok) {
      const text = await submitRes.text();
      return NextResponse.json({ success: false, errors: [`Compiler submit failed: ${text}`] }, { status: 400 });
    }

    const submitData = await submitRes.json();
    // The API returns the process ID — could be in .id or directly as a string
    const processId: string = submitData?.id ?? submitData?.data ?? submitData;

    // 2. Poll for result (up to 60s)
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 2000));

      const resultRes = await fetch(`${REMIX_API}/compile-async/${processId}`);
      if (!resultRes.ok) continue;

      const result = await resultRes.json();

      if (result.status === 'Success') {
        // Files are in result.data (Vec<FileContentMap>)
        const files: { file_name: string; file_content: string }[] = result.data ?? [];
        const sierraFile = files.find(f => f.file_name.endsWith('.contract_class.json'));
        const casmFile = files.find(f => f.file_name.endsWith('.compiled_contract_class.json'));

        if (!sierraFile || !casmFile) {
          return NextResponse.json({ success: false, errors: ['Compilation succeeded but artifacts not found'] }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          sierra: sierraFile.file_content,
          casm: casmFile.file_content,
        });
      }

      if (result.status === 'CompilationFailed') {
        return NextResponse.json({ success: false, errors: [result.message ?? 'Compilation failed'] }, { status: 400 });
      }

      if (result.status === 'UnknownError') {
        return NextResponse.json({ success: false, errors: ['Unknown compiler error'] }, { status: 500 });
      }

      // Still pending — keep polling
    }

    return NextResponse.json({ success: false, errors: ['Compilation timed out'] }, { status: 504 });
  } catch (error: any) {
    console.error('Compilation failed:', error);
    return NextResponse.json({ success: false, errors: [error.message ?? 'Compilation failed'] }, { status: 500 });
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