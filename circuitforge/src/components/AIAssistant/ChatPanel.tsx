"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';

// Use a simple icon for the key, or a more sophisticated one if available natively
const KeyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block align-text-bottom">
    <path d="M21 2l-2 2m-7 7l-2 2m-7 7l-2 2M15.5 14.5L13 17l-3.5-3.5 2.5-2.5 4.5 4.5z" />
    <path d="M12 12L3 21" />
    <path d="M15 5l2 2m-7 7l-2 2m-7 7l-2 2z" />
    <circle cx="12" cy="7" r="2" />
  </svg>
);

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are a ZK circuit design assistant for CircuitForge, a visual block-based
circuit builder. Users describe circuits in natural language and you suggest
block configurations.

Available blocks:
- cairo_private_input: Private witness (fields: NAME, TYPE)
- cairo_public_input: Public input (fields: NAME, TYPE)
- cairo_constant: Constant value (fields: VALUE)
- cairo_add, cairo_sub, cairo_mul, cairo_div: Arithmetic (inputs: LEFT, RIGHT)
- cairo_poseidon_hash: Poseidon hash (inputs: VALUE1, VALUE2)
- cairo_pedersen_hash: Pedersen hash (inputs: LEFT, RIGHT)
- cairo_assert_equal: Assert equality (inputs: LEFT, RIGHT)
- cairo_assert_range: Assert value in range (inputs: VALUE, MIN, MAX)
- cairo_assert_not_zero: Assert non-zero (inputs: VALUE)
- cairo_public_output: Circuit output (fields: NAME, inputs: VALUE)

When suggesting a circuit:
1. Explain what the circuit does and why each block is needed
2. List the blocks in connection order
3. Specify which block outputs connect to which block inputs

Keep explanations beginner-friendly. Use ZK terminology but explain it.`;

const ChatPanel: React.FC = () => {
  const { theme } = useTheme();
  const [provider, setProvider] = useState<string>(() => {
    if (typeof window === 'undefined') return 'claude';
    return localStorage.getItem('circuitforge_ai_provider') || 'claude';
  });
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    claude: '',
    chatgpt: '',
    gemini: '',
  });
  const [currentApiKeyInput, setCurrentApiKeyInput] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load API keys from localStorage on component mount
    const storedClaudeKey = localStorage.getItem('circuitforge_ai_apikey_claude') || '';
    const storedChatGptKey = localStorage.getItem('circuitforge_ai_apikey_chatgpt') || '';
    const storedGeminiKey = localStorage.getItem('circuitforge_ai_apikey_gemini') || '';
    const loadedKeys = {
      claude: storedClaudeKey,
      chatgpt: storedChatGptKey,
      gemini: storedGeminiKey,
    };
    setApiKeys(loadedKeys);
    setCurrentApiKeyInput(loadedKeys[provider as keyof typeof loadedKeys] || '');
  }, []); // Run only once on mount

  useEffect(() => {
    // Update current API key input when provider changes
    setCurrentApiKeyInput(apiKeys[provider]);
    localStorage.setItem('circuitforge_ai_provider', provider);
  }, [provider, apiKeys]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProvider(e.target.value);
    setShowApiKeyInput(false); // Hide API key input when provider changes
  };

  const handleApiKeySave = () => {
    setApiKeys((prev) => ({ ...prev, [provider]: currentApiKeyInput }));
    localStorage.setItem(`circuitforge_ai_apikey_${provider}`, currentApiKeyInput);
    setShowApiKeyInput(false);
  };

  const getMaskedApiKey = (key: string) => {
    if (key.length < 8) return '*'.repeat(key.length);
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const currentKey = apiKeys[provider];
    if (!currentKey) {
      alert('Please set your API key for the selected provider.');
      return;
    }

    const userMessage: ChatMessage = { role: 'user', content: inputMessage };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          apiKey: currentKey,
          system: SYSTEM_PROMPT,
          messages: [...messages, userMessage].map(msg => ({ // Send full conversation
            role: msg.role,
            content: msg.content
          })),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.text }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${data.error || 'Unknown error'}` }]);
      }
    } catch (error: any) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `Network error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: theme.bgSecondary, color: theme.text }}>
      <div className="flex items-center justify-between p-3" style={{ borderBottom: `1px solid ${theme.border}` }}>
        <h3 className="text-lg font-semibold">AI Assistant</h3>
        <div className="flex items-center space-x-2">
          <select
            value={provider}
            onChange={handleProviderChange}
            className="rounded-md px-2 py-1 text-sm focus:outline-none"
            style={{ backgroundColor: theme.btnBg, color: theme.text, border: `1px solid ${theme.border}` }}
          >
            <option value="claude">Claude (Anthropic)</option>
            <option value="chatgpt">ChatGPT (OpenAI)</option>
            <option value="gemini">Gemini (Google)</option>
          </select>
          <button
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className="flex items-center rounded-md px-3 py-1 text-sm"
            style={{ backgroundColor: theme.btnBg, color: theme.textMuted }}
          >
            <KeyIcon />
            <span className="ml-1">Set API Key</span>
          </button>
        </div>
      </div>

      {showApiKeyInput && (
        <div className="flex items-center space-x-2 p-3" style={{ backgroundColor: theme.bg, borderBottom: `1px solid ${theme.border}` }}>
          <input
            type="password"
            value={currentApiKeyInput}
            onChange={(e) => setCurrentApiKeyInput(e.target.value)}
            placeholder={`Enter ${provider} API key`}
            className="grow rounded-md px-3 py-2 text-sm focus:outline-none"
            style={{ backgroundColor: theme.btnBg, color: theme.text, border: `1px solid ${theme.border}` }}
          />
          <button
            onClick={handleApiKeySave}
            className="rounded-md px-3 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: theme.accent }}
          >
            Save
          </button>
        </div>
      )}
      {!showApiKeyInput && apiKeys[provider] && (
        <div className="px-3 py-2 text-sm" style={{ backgroundColor: theme.bg, borderBottom: `1px solid ${theme.border}`, color: theme.textMuted }}>
          API Key for {provider}: {getMaskedApiKey(apiKeys[provider])}
        </div>
      )}


      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[70%] rounded-lg p-3"
              style={{
                backgroundColor: msg.role === 'user' ? theme.accent : theme.btnBg,
                color: msg.role === 'user' ? '#fff' : theme.text,
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="mb-4 flex justify-start">
            <div className="max-w-[70%] rounded-lg p-3" style={{ backgroundColor: theme.btnBg, color: theme.text }}>
              <div className="animate-pulse">...</div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4" style={{ borderTop: `1px solid ${theme.border}` }}>
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type your message..."
            className="grow rounded-md px-4 py-2 focus:outline-none"
            style={{ backgroundColor: theme.btnBg, color: theme.text, border: `1px solid ${theme.border}` }}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            className="rounded-md px-4 py-2 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: theme.accent }}
            disabled={isLoading || !inputMessage.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
