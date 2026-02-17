import { NextRequest, NextResponse } from 'next/server';
import PinataSDK from '@pinata/sdk';

export async function POST(req: NextRequest) {
  const { circuit, apiKey, apiSecret } = await req.json();

  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { success: false, error: 'Pinata API key and secret required' },
      { status: 400 }
    );
  }

  try {
    const pinata = new PinataSDK(apiKey, apiSecret);
    const result = await pinata.pinJSONToIPFS(circuit, {
      pinataMetadata: { name: circuit.name || 'CircuitForge Circuit' },
    });
    return NextResponse.json({ success: true, ipfsHash: result.IpfsHash });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to pin to IPFS' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const hash = req.nextUrl.searchParams.get('hash');
  if (!hash) {
    return NextResponse.json(
      { success: false, error: 'Missing hash parameter' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`);
    if (!response.ok) throw new Error('Failed to fetch from IPFS');
    const data = await response.json();
    return NextResponse.json({ success: true, circuit: data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch from IPFS' },
      { status: 500 }
    );
  }
}
