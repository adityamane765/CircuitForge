"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface PinataKeys {
  apiKey: string;
  apiSecret: string;
}

interface PinataSettingsProps {
  onKeysChange: (keys: PinataKeys | null) => void;
}

const STORAGE_KEY = 'circuitforge_pinata';

const PinataSettings: React.FC<PinataSettingsProps> = ({ onKeysChange }) => {
  const { theme } = useTheme();
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [saved, setSaved] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const keys: PinataKeys = JSON.parse(stored);
        setApiKey(keys.apiKey);
        setApiSecret(keys.apiSecret);
        setSaved(true);
        onKeysChange(keys);
      } catch {
        // ignore corrupted data
      }
    }
  }, [onKeysChange]);

  const handleSave = () => {
    if (!apiKey.trim() || !apiSecret.trim()) return;
    const keys: PinataKeys = { apiKey: apiKey.trim(), apiSecret: apiSecret.trim() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
    setSaved(true);
    setShowSettings(false);
    onKeysChange(keys);
  };

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey('');
    setApiSecret('');
    setSaved(false);
    onKeysChange(null);
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: saved ? theme.green : theme.textMuted }}
          />
          <span className="text-sm" style={{ color: theme.textMuted }}>
            Pinata {saved ? 'Connected' : 'Not configured'}
          </span>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-xs hover:underline"
          style={{ color: theme.textAccent }}
        >
          {showSettings ? 'Hide' : 'Settings'}
        </button>
      </div>

      {showSettings && (
        <div className="mt-3 space-y-2 rounded-md p-3" style={{ backgroundColor: `${theme.btnBg}80` }}>
          <div>
            <label className="mb-1 block text-xs" style={{ color: theme.textMuted }}>API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter Pinata API Key"
              className="w-full rounded px-3 py-1.5 text-sm focus:outline-none"
              style={{ backgroundColor: theme.btnBg, color: theme.text }}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs" style={{ color: theme.textMuted }}>API Secret</label>
            <input
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              placeholder="Enter Pinata API Secret"
              className="w-full rounded px-3 py-1.5 text-sm focus:outline-none"
              style={{ backgroundColor: theme.btnBg, color: theme.text }}
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={!apiKey.trim() || !apiSecret.trim()}
              className="rounded px-3 py-1 text-xs text-white disabled:opacity-50"
              style={{ backgroundColor: theme.accent }}
            >
              Save Keys
            </button>
            {saved && (
              <button
                onClick={handleClear}
                className="rounded px-3 py-1 text-xs text-white"
                style={{ backgroundColor: `${theme.red}80` }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PinataSettings;
