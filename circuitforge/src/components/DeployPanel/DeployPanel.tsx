"use client";

import React, { useState, useEffect } from 'react';
import { connect, disconnect, StarknetWindowObject } from 'get-starknet';
import { WalletAccount, RpcProvider, CallData, hash as starkHash } from 'starknet';
import { useTheme } from '@/context/ThemeContext';

interface DeployPanelProps {
  cairoCode: string;
}

type DeployStatus = 'idle' | 'compiling' | 'declaring' | 'deploying' | 'deployed' | 'error';

interface Step {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'done' | 'error';
  message?: string;
}

const SEPOLIA_RPC_URL = 'https://rpc.starknet-testnet.lava.build';

// Universal Deployer Contract on Starknet Sepolia
const UDC_ADDRESS = '0x041a78e741e5af2fec34b695679bc6891742439f7afb8484ecd7766661ad02bf';

const DeployPanel: React.FC<DeployPanelProps> = ({ cairoCode }) => {
  const { theme } = useTheme();
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [wallet, setWallet] = useState<StarknetWindowObject | null>(null);
  const [status, setStatus] = useState<DeployStatus>('idle');
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [steps, setSteps] = useState<Step[]>([
    { id: 'compile', name: 'Compile Cairo Code', status: 'pending' },
    { id: 'connect', name: 'Connect Wallet', status: 'pending' },
    { id: 'declare', name: 'Declare Contract', status: 'pending' },
    { id: 'deploy', name: 'Deploy Instance', status: 'pending' },
  ]);

  const updateStepStatus = (id: string, newStatus: Step['status'], message?: string) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, status: newStatus, message } : step))
    );
  };

  useEffect(() => {
    const reconnectWallet = async () => {
      try {
        const connectedWallet = await connect({ modalMode: "neverAsk" });
        if (connectedWallet) {
          const rpcProvider = new RpcProvider({ nodeUrl: SEPOLIA_RPC_URL });
          const walletAccount = await WalletAccount.connect(rpcProvider, connectedWallet);
          setAccount(walletAccount);
          setWallet(connectedWallet);
          updateStepStatus('connect', 'done', `Wallet reconnected: ${connectedWallet.name}`);
        }
      } catch (error) {
        console.error("Failed to silently reconnect wallet:", error);
      }
    };
    reconnectWallet();
  }, []);

  const handleConnectWallet = async () => {
    setErrorMessage(null);
    try {
      updateStepStatus('connect', 'in-progress');
      const connectedWallet = await connect();
      if (connectedWallet) {
        const rpcProvider = new RpcProvider({ nodeUrl: SEPOLIA_RPC_URL });
        const walletAccount = await WalletAccount.connect(rpcProvider, connectedWallet);
        setAccount(walletAccount);
        setWallet(connectedWallet);
        updateStepStatus('connect', 'done', `Connected to ${connectedWallet.name}`);
      } else {
        updateStepStatus('connect', 'error', 'Wallet connection failed or cancelled');
        setErrorMessage('Wallet connection failed or cancelled.');
      }
    } catch (error: any) {
      updateStepStatus('connect', 'error', `Connection error: ${error.message}`);
      setErrorMessage(`Failed to connect wallet: ${error.message}`);
    }
  };

  const handleDisconnectWallet = async () => {
    if (wallet) {
      await disconnect({ clearLastWallet: true });
      setAccount(null);
      setWallet(null);
      setErrorMessage(null);
      setSteps((prev) => prev.map((step) =>
        step.id === 'connect' ? { ...step, status: 'pending', message: undefined } : step
      ));
    }
  };

  const handleDeploy = async () => {
    if (!account || !cairoCode) {
      setErrorMessage('Please connect wallet and ensure Cairo code is present.');
      return;
    }

    setContractAddress(null);
    setErrorMessage(null);
    // Reset only compile/declare/deploy steps, keep connect status
    setSteps((prev) => prev.map(step =>
      step.id === 'connect' ? step : { ...step, status: 'pending' as const, message: undefined }
    ));
    setStatus('compiling');

    try {
      // 1. Compile Cairo Code
      updateStepStatus('compile', 'in-progress', 'Sending code to compiler...');
      const compileResponse = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cairoCode }),
      });
      const compileData = await compileResponse.json();

      if (!compileResponse.ok || !compileData.success) {
        throw new Error(compileData.errors?.join(', ') || 'Compilation failed.');
      }
      const { sierra, casm } = compileData;
      updateStepStatus('compile', 'done', 'Cairo code compiled successfully.');

      // 2. Declare Contract (server-side via API)
      setStatus('declaring');
      updateStepStatus('declare', 'in-progress', 'Declaring contract on Starknet...');

      const declareResponse = await fetch('/api/compile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sierra, casm }),
      });
      const declareData = await declareResponse.json();

      if (!declareResponse.ok || !declareData.success) {
        throw new Error(declareData.errors?.join(', ') || 'Declaration failed.');
      }
      const classHash = declareData.classHash;
      updateStepStatus('declare', 'done', `Contract declared (Class Hash: ${classHash.slice(0, 10)}...)`);

      // 3. Deploy via UDC using wallet's execute()
      setStatus('deploying');
      updateStepStatus('deploy', 'in-progress', 'Deploying contract (approve in wallet)...');

      const salt = '0x' + Math.floor(Math.random() * 2**64).toString(16);
      const unique = 1; // unique address per deployer

      const deployResult = await account.execute({
        contractAddress: UDC_ADDRESS,
        entrypoint: 'deployContract',
        calldata: CallData.compile({
          classHash,
          salt,
          unique,
          calldata: [],
        }),
      });

      updateStepStatus('deploy', 'in-progress', `Waiting for deploy tx confirmation...`);
      const rpcProvider = new RpcProvider({ nodeUrl: SEPOLIA_RPC_URL });
      const receipt = await rpcProvider.waitForTransaction(deployResult.transaction_hash, { retryInterval: 2000 });

      // Extract deployed contract address from events
      let deployedAddress: string | null = null;
      if (receipt && 'events' in receipt && Array.isArray(receipt.events)) {
        // UDC emits ContractDeployed event with address as first data element
        for (const event of receipt.events) {
          if (event.from_address?.toLowerCase() === UDC_ADDRESS.toLowerCase()) {
            deployedAddress = event.data?.[0] || null;
            break;
          }
        }
      }

      if (!deployedAddress) {
        // Fallback: compute expected address
        deployedAddress = deployResult.transaction_hash;
        updateStepStatus('deploy', 'done', 'Contract deployed (check tx on explorer).');
      } else {
        updateStepStatus('deploy', 'done', 'Contract instance deployed.');
      }

      setContractAddress(deployedAddress);
      setStatus('deployed');
    } catch (error: any) {
      console.error('Deployment error:', error);
      setErrorMessage(error.message || 'An unknown error occurred during deployment.');
      setStatus('error');
      setSteps(prevSteps => {
        const errorIdx = prevSteps.findIndex(step => step.status === 'in-progress');
        if (errorIdx !== -1) {
          return prevSteps.map((step, idx) => (
            idx < errorIdx ? step :
            idx === errorIdx ? { ...step, status: 'error' as const, message: error.message || 'Failed' } :
            { ...step, status: 'pending' as const, message: undefined }
          ));
        }
        return prevSteps;
      });
    }
  };

  const getStatusIcon = (stepStatus: Step['status']) => {
    switch (stepStatus) {
      case 'pending': return '⚪';
      case 'in-progress': return '⏳';
      case 'done': return '✅';
      case 'error': return '❌';
    }
  };

  const canDeploy = account && cairoCode && cairoCode.trim() !== '// Drag and drop blocks to generate Cairo code!' && cairoCode.trim() !== '// Fix errors in your blocks to generate Cairo code.';

  return (
    <div className="flex h-full flex-col p-4" style={{ backgroundColor: theme.bgSecondary, color: theme.text }}>
      <h3 className="mb-4 text-lg font-semibold">Deploy to Starknet</h3>

      <div className="flex flex-col space-y-3 mb-6">
        {account ? (
          <div className="flex items-center justify-between p-3 rounded-md border" style={{ backgroundColor: `${theme.green}15`, borderColor: `${theme.green}50` }}>
            <p className="text-sm" style={{ color: theme.green }}>Wallet Connected: {account.address.slice(0, 6)}...{account.address.slice(-4)}</p>
            <button
              onClick={handleDisconnectWallet}
              className="px-3 py-1 text-xs rounded-md text-white"
              style={{ backgroundColor: theme.red }}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnectWallet}
            disabled={status !== 'idle' && status !== 'error'}
            className="px-4 py-2 rounded-md text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: theme.accent }}
          >
            Connect Wallet
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-6">
        <h4 className="text-md font-medium mb-2">Deployment Steps:</h4>
        {steps.map((step) => (
          <div key={step.id} className="flex items-center space-x-3">
            <div className="text-xl">{getStatusIcon(step.status)}</div>
            <div className="flex-1">
              <p className="font-medium" style={{ color: step.status === 'done' ? theme.green : step.status === 'error' ? theme.red : theme.text }}>
                {step.name}
              </p>
              {step.message && <p className="text-xs" style={{ color: theme.textMuted }}>{step.message}</p>}
            </div>
          </div>
        ))}
      </div>

      {errorMessage && (
        <div className="p-3 mb-4 rounded-md border text-sm" style={{ backgroundColor: `${theme.red}15`, borderColor: `${theme.red}50`, color: theme.red }}>
          Error: {errorMessage}
        </div>
      )}

      {contractAddress && (
        <div className="p-3 mb-4 rounded-md border text-sm" style={{ backgroundColor: `${theme.green}15`, borderColor: `${theme.green}50`, color: theme.green }}>
          <p className="font-semibold">Contract Deployed!</p>
          <a
            href={`https://sepolia.starkscan.co/contract/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline break-all"
            style={{ color: theme.textAccent }}
          >
            {contractAddress}
          </a>
        </div>
      )}

      <button
        onClick={handleDeploy}
        disabled={!canDeploy || status === 'compiling' || status === 'declaring' || status === 'deploying'}
        className="px-4 py-2 rounded-md text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: theme.green }}
      >
        {status === 'compiling' || status === 'declaring' || status === 'deploying' ? 'Deploying...' : 'Start Deployment'}
      </button>
    </div>
  );
};

export default DeployPanel;
