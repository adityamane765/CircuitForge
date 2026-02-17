"use client";

import React, { useState, useCallback } from 'react';
import PinataSettings from './PinataSettings';
import { useTheme } from '@/context/ThemeContext';

interface PinataKeys {
  apiKey: string;
  apiSecret: string;
}

interface MarketplacePanelProps {
  cairoCode: string;
  workspaceJson: object | null;
  onLoadCircuit: (workspaceJson: object) => void;
}

const MarketplacePanel: React.FC<MarketplacePanelProps> = ({
  cairoCode,
  workspaceJson,
  onLoadCircuit,
}) => {
  const { theme } = useTheme();
  const [pinataKeys, setPinataKeys] = useState<PinataKeys | null>(null);

  // Publish state
  const [circuitName, setCircuitName] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishedHash, setPublishedHash] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Browse state
  const [ipfsHash, setIpfsHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleKeysChange = useCallback((keys: PinataKeys | null) => {
    setPinataKeys(keys);
  }, []);

  const handlePublish = async () => {
    if (!pinataKeys || !workspaceJson || !circuitName.trim()) return;

    setPublishing(true);
    setPublishError(null);
    setPublishedHash(null);

    try {
      const circuitData = {
        name: circuitName.trim(),
        description: description.trim(),
        author: author.trim(),
        workspace: workspaceJson,
        cairoCode,
        publishedAt: new Date().toISOString(),
        version: '1.0',
      };

      const response = await fetch('/api/pinata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          circuit: circuitData,
          apiKey: pinataKeys.apiKey,
          apiSecret: pinataKeys.apiSecret,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to publish');
      }

      setPublishedHash(data.ipfsHash);
      setCircuitName('');
      setDescription('');
      setAuthor('');
    } catch (error: any) {
      setPublishError(error.message || 'Failed to publish circuit');
    } finally {
      setPublishing(false);
    }
  };

  const handleLoadFromIPFS = async () => {
    if (!ipfsHash.trim()) return;

    setLoading(true);
    setLoadError(null);

    try {
      const response = await fetch(`/api/pinata?hash=${encodeURIComponent(ipfsHash.trim())}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to load circuit');
      }

      const circuit = data.circuit;
      if (!circuit.workspace || typeof circuit.workspace !== 'object') {
        throw new Error('Invalid circuit data: missing or malformed workspace');
      }
      if (!circuit.workspace.blocks) {
        throw new Error('Invalid circuit data: workspace has no blocks');
      }

      onLoadCircuit(circuit.workspace);
      setIpfsHash('');
    } catch (error: any) {
      setLoadError(error.message || 'Failed to load circuit');
    } finally {
      setLoading(false);
    }
  };

  const canPublish = pinataKeys && workspaceJson && circuitName.trim() && !publishing;

  const inputStyle = {
    backgroundColor: theme.btnBg,
    color: theme.text,
    border: 'none',
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4" style={{ backgroundColor: theme.bgSecondary, color: theme.text }}>
      <h3 className="mb-3 text-lg font-semibold">Circuit Marketplace</h3>

      <PinataSettings onKeysChange={handleKeysChange} />

      {/* Publish Section */}
      <div className="mb-6">
        <h4 className="mb-2 text-sm font-medium" style={{ color: theme.text }}>Publish Circuit</h4>
        <div className="space-y-2">
          <input
            type="text"
            value={circuitName}
            onChange={(e) => setCircuitName(e.target.value)}
            placeholder="Circuit name (required)"
            className="w-full rounded px-3 py-1.5 text-sm focus:outline-none"
            style={inputStyle}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full resize-none rounded px-3 py-1.5 text-sm focus:outline-none"
            style={inputStyle}
          />
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author (optional)"
            className="w-full rounded px-3 py-1.5 text-sm focus:outline-none"
            style={inputStyle}
          />
          <button
            onClick={handlePublish}
            disabled={!canPublish}
            className="w-full rounded px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: theme.accent }}
          >
            {publishing ? 'Publishing...' : 'Publish to IPFS'}
          </button>

          {!pinataKeys && (
            <p className="text-xs" style={{ color: theme.yellow }}>Configure Pinata API keys above to publish.</p>
          )}
        </div>

        {publishError && (
          <div className="mt-2 rounded p-2 text-xs" style={{ backgroundColor: `${theme.red}15`, border: `1px solid ${theme.red}50`, color: theme.red }}>
            {publishError}
          </div>
        )}

        {publishedHash && (
          <div className="mt-2 rounded p-2" style={{ backgroundColor: `${theme.green}15`, border: `1px solid ${theme.green}50` }}>
            <p className="text-xs font-medium" style={{ color: theme.green }}>Published successfully!</p>
            <p className="mt-1 text-xs" style={{ color: theme.textMuted }}>IPFS Hash:</p>
            <p className="break-all text-xs font-mono" style={{ color: theme.textAccent }}>{publishedHash}</p>
            <a
              href={`https://gateway.pinata.cloud/ipfs/${publishedHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-xs hover:underline"
              style={{ color: theme.textAccent }}
            >
              View on IPFS Gateway
            </a>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mb-4" style={{ borderTop: `1px solid ${theme.border}` }} />

      {/* Browse / Load Section */}
      <div>
        <h4 className="mb-2 text-sm font-medium" style={{ color: theme.text }}>Load from IPFS</h4>
        <div className="flex space-x-2">
          <input
            type="text"
            value={ipfsHash}
            onChange={(e) => setIpfsHash(e.target.value)}
            placeholder="Paste IPFS hash (Qm...)"
            onKeyDown={(e) => e.key === 'Enter' && handleLoadFromIPFS()}
            className="flex-1 rounded px-3 py-1.5 text-sm focus:outline-none"
            style={inputStyle}
          />
          <button
            onClick={handleLoadFromIPFS}
            disabled={!ipfsHash.trim() || loading}
            className="rounded px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: theme.accent }}
          >
            {loading ? 'Loading...' : 'Load'}
          </button>
        </div>

        {loadError && (
          <div className="mt-2 rounded p-2 text-xs" style={{ backgroundColor: `${theme.red}15`, border: `1px solid ${theme.red}50`, color: theme.red }}>
            {loadError}
          </div>
        )}

        {/* Featured circuits for demo */}
        <div className="mt-4">
          <p className="mb-2 text-xs" style={{ color: theme.textMuted }}>
            Share the IPFS hash with others so they can load your circuit!
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePanel;
