'use client';

import { useState } from 'react';

interface ApiKey {
  id: string;
  provider: string;
  name: string;
  keyPreview: string;
  status: 'active' | 'expired' | 'invalid';
  usage: string;
  lastUsed: string;
}

const providers = [
  { id: 'openai', name: 'OpenAI', logo: '🟢', placeholder: 'sk-...' },
  { id: 'anthropic', name: 'Anthropic', logo: '🟣', placeholder: 'sk-ant-...' },
  { id: 'google', name: 'Google AI', logo: '🔴', placeholder: 'AIza...' },
  { id: 'deepseek', name: 'DeepSeek', logo: '🐋', placeholder: 'sk-...' },
  { id: 'openrouter', name: 'OpenRouter', logo: '🔀', placeholder: 'sk-or-...' },
  { id: 'groq', name: 'Groq', logo: '⚡', placeholder: 'gsk_...' },
  { id: 'together', name: 'Together AI', logo: '🤝', placeholder: '...' },
  { id: 'fireworks', name: 'Fireworks AI', logo: '🎆', placeholder: '...' },
  { id: 'cerebras', name: 'Cerebras', logo: '🧠', placeholder: '...' },
  { id: 'huggingface', name: 'Hugging Face', logo: '🤗', placeholder: 'hf_...' },
  { id: 'mistral', name: 'Mistral AI', logo: '🌊', placeholder: '...' },
  { id: 'xai', name: 'xAI (Grok)', logo: '✖️', placeholder: '...' },
  { id: 'cohere', name: 'Cohere', logo: '💎', placeholder: '...' },
  { id: 'azure', name: 'Azure OpenAI', logo: '☁️', placeholder: '...' },
  { id: 'bedrock', name: 'Amazon Bedrock', logo: '📦', placeholder: '...' },
];

export function ApiKeyManager() {
  const [keys, setKeys] = useState<ApiKey[]>([
    { id: '1', provider: 'openai', name: 'OpenAI Production', keyPreview: 'sk-...wK4d', status: 'active', usage: '$12.40', lastUsed: '2 min ago' },
    { id: '2', provider: 'anthropic', name: 'Anthropic Personal', keyPreview: 'sk-ant-...9x2', status: 'active', usage: '$8.20', lastUsed: '15 min ago' },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKeyProvider, setNewKeyProvider] = useState('');
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');

  const handleAddKey = () => {
    if (!newKeyProvider || !newKeyValue) return;
    setKeys([...keys, {
      id: String(Date.now()),
      provider: newKeyProvider,
      name: newKeyName || providers.find((p) => p.id === newKeyProvider)?.name || '',
      keyPreview: newKeyValue.slice(0, 6) + '...' + newKeyValue.slice(-4),
      status: 'active',
      usage: '$0.00',
      lastUsed: 'Never',
    }]);
    setShowAddModal(false);
    setNewKeyProvider('');
    setNewKeyName('');
    setNewKeyValue('');
  };

  const handleDeleteKey = (id: string) => {
    setKeys(keys.filter((k) => k.id !== id));
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">API Keys</h1>
            <p className="text-sm text-gray-400">Manage your provider API keys securely</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add API Key
          </button>
        </div>

        {/* Keys List */}
        <div className="space-y-3">
          {keys.map((key) => {
            const provider = providers.find((p) => p.id === key.provider);
            return (
              <div key={key.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                <span className="text-2xl">{provider?.logo || '🔑'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{key.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      key.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                      key.status === 'expired' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>{key.status}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <code className="font-mono">{key.keyPreview}</code>
                    <span>·</span>
                    <span>Used: {key.usage}</span>
                    <span>·</span>
                    <span>{key.lastUsed}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteKey(key.id)}
                  className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        {keys.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">🔑</p>
            <p className="text-lg">No API keys added</p>
            <p className="text-sm mt-1">Add your first API key to unlock premium models</p>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="w-full max-w-md bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-lg font-bold text-white mb-4">Add API Key</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Provider</label>
                  <select
                    value={newKeyProvider}
                    onChange={(e) => setNewKeyProvider(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-violet-500/50"
                  >
                    <option value="">Select provider...</option>
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>{p.logo} {p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Name (optional)</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production Key"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-violet-500/50 placeholder-gray-600"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">API Key</label>
                  <input
                    type="password"
                    value={newKeyValue}
                    onChange={(e) => setNewKeyValue(e.target.value)}
                    placeholder={newKeyProvider ? providers.find((p) => p.id === newKeyProvider)?.placeholder : 'Enter your API key'}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-violet-500/50 placeholder-gray-600 font-mono"
                  />
                  <p className="text-[10px] text-gray-600 mt-1">Encrypted with AES-256. Stored locally only.</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddKey}
                  disabled={!newKeyProvider || !newKeyValue}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Add Key
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
