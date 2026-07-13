'use client';

import { useState } from 'react';
import { ModelCard, ModelData } from './ModelCard';
import { useChatStore } from '@/store/chatStore';

const FILTER_TAGS = [
  'all', 'free', 'premium', 'coding', 'reasoning', 'math', 'vision', 'fast', 'creative',
  'long_context', 'local', 'offline', 'open_source', 'cheap',
];

const SORT_OPTIONS = [
  { id: 'name', label: 'Name' },
  { id: 'reasoning', label: 'Reasoning' },
  { id: 'coding', label: 'Coding' },
  { id: 'speed', label: 'Speed' },
  { id: 'cost', label: 'Cost' },
  { id: 'context', label: 'Context' },
];

const ALL_MODELS: ModelData[] = [
  { id: 'deepseek-chat', name: 'DeepSeek Chat V3', provider: 'deepseek', tier: 'free', version: 'V3', context_window: 128000, parameters: '671B MoE', license: 'MIT', open_source: true, capabilities: ['coding', 'reasoning', 'math'], reasoning_score: 0.88, coding_score: 0.92, math_score: 0.90, vision: false, cost_per_1m_input: 0, cost_per_1m_output: 0, latency_ms: 800, speed_tokens_per_sec: 60, gpu_requirement: null, ram_requirement: null, download_size: null, description: 'DeepSeek V3 - top-tier free model with 671B parameters', tags: ['free', 'coding', 'reasoning'] },
  { id: 'deepseek-reasoner', name: 'DeepSeek R1', provider: 'deepseek', tier: 'free', version: 'R1', context_window: 128000, parameters: '671B MoE', license: 'MIT', open_source: true, capabilities: ['reasoning', 'math', 'coding'], reasoning_score: 0.95, coding_score: 0.90, math_score: 0.95, vision: false, cost_per_1m_input: 0, cost_per_1m_output: 0, latency_ms: 5000, speed_tokens_per_sec: 30, gpu_requirement: null, ram_requirement: null, download_size: null, description: 'DeepSeek R1 - advanced reasoning model', tags: ['free', 'reasoning', 'math'] },
  { id: 'qwen-2.5-72b', name: 'Qwen 2.5 72B', provider: 'openrouter', tier: 'free', version: '2.5', context_window: 128000, parameters: '72B', license: 'Apache 2.0', open_source: true, capabilities: ['coding', 'reasoning', 'math', 'vision'], reasoning_score: 0.85, coding_score: 0.88, math_score: 0.87, vision: true, cost_per_1m_input: 0, cost_per_1m_output: 0, latency_ms: 600, speed_tokens_per_sec: 50, gpu_requirement: null, ram_requirement: null, download_size: null, description: 'Qwen 2.5 72B - strong multilingual model with vision', tags: ['free', 'coding', 'vision'] },
  { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', provider: 'groq', tier: 'free', version: '3.1', context_window: 128000, parameters: '70B', license: 'Llama 3.1 Community', open_source: true, capabilities: ['coding', 'reasoning', 'math'], reasoning_score: 0.82, coding_score: 0.84, math_score: 0.80, vision: false, cost_per_1m_input: 0, cost_per_1m_output: 0, latency_ms: 300, speed_tokens_per_sec: 180, gpu_requirement: null, ram_requirement: null, download_size: null, description: 'Llama 3.1 70B on Groq - blazing fast free inference', tags: ['free', 'fast', 'coding'] },
  { id: 'llama-3.1-8b', name: 'Llama 3.1 8B', provider: 'groq', tier: 'free', version: '3.1', context_window: 128000, parameters: '8B', license: 'Llama 3.1 Community', open_source: true, capabilities: ['coding', 'reasoning'], reasoning_score: 0.65, coding_score: 0.68, math_score: 0.62, vision: false, cost_per_1m_input: 0, cost_per_1m_output: 0, latency_ms: 150, speed_tokens_per_sec: 350, gpu_requirement: null, ram_requirement: null, download_size: null, description: 'Llama 3.1 8B on Groq - fastest free option', tags: ['free', 'fast'] },
  { id: 'gemma-2-27b', name: 'Gemma 2 27B', provider: 'openrouter', tier: 'free', version: '2', context_window: 8192, parameters: '27B', license: 'Gemma Terms', open_source: true, capabilities: ['coding', 'reasoning'], reasoning_score: 0.78, coding_score: 0.80, math_score: 0.75, vision: false, cost_per_1m_input: 0, cost_per_1m_output: 0, latency_ms: 400, speed_tokens_per_sec: 100, gpu_requirement: null, ram_requirement: null, download_size: null, description: 'Google Gemma 2 27B - open model', tags: ['free', 'coding'] },
  { id: 'phi-3.5', name: 'Phi-3.5 MoE', provider: 'openrouter', tier: 'free', version: '3.5', context_window: 128000, parameters: '42B MoE', license: 'MIT', open_source: true, capabilities: ['coding', 'reasoning', 'vision'], reasoning_score: 0.80, coding_score: 0.82, math_score: 0.78, vision: true, cost_per_1m_input: 0, cost_per_1m_output: 0, latency_ms: 350, speed_tokens_per_sec: 120, gpu_requirement: null, ram_requirement: null, download_size: null, description: 'Microsoft Phi-3.5 MoE - small but capable', tags: ['free', 'vision'] },
  { id: 'local-llama-3.1-8b', name: 'Llama 3.1 8B (Local)', provider: 'ollama', tier: 'local', version: '3.1', context_window: 128000, parameters: '8B', license: 'Llama 3.1 Community', open_source: true, capabilities: ['coding', 'reasoning'], reasoning_score: 0.65, coding_score: 0.68, math_score: 0.62, vision: false, cost_per_1m_input: 0, cost_per_1m_output: 0, latency_ms: null, speed_tokens_per_sec: null, gpu_requirement: '4GB VRAM', ram_requirement: '8GB RAM', download_size: '4.7GB', description: 'Run Llama 3.1 8B locally via Ollama - fully offline', tags: ['local', 'offline'] },
  { id: 'local-qwen-2.5-7b', name: 'Qwen 2.5 7B (Local)', provider: 'ollama', tier: 'local', version: '2.5', context_window: 128000, parameters: '7B', license: 'Apache 2.0', open_source: true, capabilities: ['coding', 'reasoning', 'vision'], reasoning_score: 0.70, coding_score: 0.73, math_score: 0.68, vision: true, cost_per_1m_input: 0, cost_per_1m_output: 0, latency_ms: null, speed_tokens_per_sec: null, gpu_requirement: '4GB VRAM', ram_requirement: '8GB RAM', download_size: '4.4GB', description: 'Run Qwen 2.5 7B locally with vision support', tags: ['local', 'offline', 'vision'] },
  { id: 'local-deepseek-coder', name: 'DeepSeek Coder V2 (Local)', provider: 'ollama', tier: 'local', version: 'V2', context_window: 128000, parameters: '16B', license: 'MIT', open_source: true, capabilities: ['coding'], reasoning_score: 0.72, coding_score: 0.88, math_score: 0.70, vision: false, cost_per_1m_input: 0, cost_per_1m_output: 0, latency_ms: null, speed_tokens_per_sec: null, gpu_requirement: '8GB VRAM', ram_requirement: '16GB RAM', download_size: '8.9GB', description: 'DeepSeek Coder V2 - local coding specialist', tags: ['local', 'coding'] },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', tier: 'premium', version: '4o', context_window: 128000, parameters: null, license: 'Proprietary', open_source: false, capabilities: ['coding', 'reasoning', 'math', 'vision', 'creative'], reasoning_score: 0.92, coding_score: 0.90, math_score: 0.92, vision: true, cost_per_1m_input: 2.50, cost_per_1m_output: 10.00, latency_ms: 500, speed_tokens_per_sec: 80, gpu_requirement: null, ram_requirement: null, download_size: null, description: 'GPT-4o - OpenAI flagship multimodal model', tags: ['premium', 'all'] },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', tier: 'premium', version: '4o-mini', context_window: 128000, parameters: null, license: 'Proprietary', open_source: false, capabilities: ['coding', 'reasoning', 'math', 'vision'], reasoning_score: 0.80, coding_score: 0.82, math_score: 0.80, vision: true, cost_per_1m_input: 0.15, cost_per_1m_output: 0.60, latency_ms: 300, speed_tokens_per_sec: 120, gpu_requirement: null, ram_requirement: null, download_size: null, description: 'GPT-4o Mini - fast and affordable', tags: ['premium', 'cheap'] },
  { id: 'o1', name: 'o1', provider: 'openai', tier: 'premium', version: 'o1', context_window: 200000, parameters: null, license: 'Proprietary', open_source: false, capabilities: ['reasoning', 'math', 'coding'], reasoning_score: 0.98, coding_score: 0.93, math_score: 0.98, vision: false, cost_per_1m_input: 15.00, cost_per_1m_output: 60.00, latency_ms: 10000, speed_tokens_per_sec: 30, gpu_requirement: null, ram_requirement: null, download_size: null, description: 'o1 - OpenAI reasoning model', tags: ['premium', 'reasoning'] },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic', tier: 'premium', version: '3.5', context_window: 200000, parameters: null, license: 'Proprietary', open_source: false, capabilities: ['coding', 'reasoning', 'math', 'vision', 'creative'], reasoning_score: 0.92, coding_score: 0.95, math_score: 0.88, vision: true, cost_per_1m_input: 3.00, cost_per_1m_output: 15.00, latency_ms: 600, speed_tokens_per_sec: 70, gpu_requirement: null, ram_requirement: null, download_size: null, description: 'Claude 3.5 Sonnet - best for coding tasks', tags: ['premium', 'coding'] },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'anthropic', tier: 'premium', version: '3', context_window: 200000, parameters: null, license: 'Proprietary', open_source: false, capabilities: ['coding', 'reasoning', 'math', 'vision', 'creative'], reasoning_score: 0.94, coding_score: 0.93, math_score: 0.90, vision: true, cost_per_1m_input: 15.00, cost_per_1m_output: 75.00, latency_ms: 1500, speed_tokens_per_sec: 40, gpu_requirement: null, ram_requirement: null, download_size: null, description: 'Claude 3 Opus - most capable Anthropic model', tags: ['premium', 'creative'] },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google', tier: 'premium', version: '1.5', context_window: 2000000, parameters: null, license: 'Proprietary', open_source: false, capabilities: ['coding', 'reasoning', 'math', 'vision', 'long_context'], reasoning_score: 0.90, coding_score: 0.88, math_score: 0.88, vision: true, cost_per_1m_input: 1.25, cost_per_1m_output: 5.00, latency_ms: 700, speed_tokens_per_sec: 60, gpu_requirement: null, ram_requirement: null, download_size: null, description: 'Gemini 1.5 Pro - 2M context window', tags: ['premium', 'long_context'] },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'google', tier: 'premium', version: '2.0', context_window: 1000000, parameters: null, license: 'Proprietary', open_source: false, capabilities: ['coding', 'reasoning', 'vision'], reasoning_score: 0.85, coding_score: 0.83, math_score: 0.82, vision: true, cost_per_1m_input: 0.10, cost_per_1m_output: 0.40, latency_ms: 250, speed_tokens_per_sec: 250, gpu_requirement: null, ram_requirement: null, download_size: null, description: 'Gemini 2.0 Flash - latest Google model', tags: ['premium', 'fast'] },
  { id: 'grok-2', name: 'Grok-2', provider: 'xai', tier: 'premium', version: '2', context_window: 131072, parameters: null, license: 'Proprietary', open_source: false, capabilities: ['coding', 'reasoning', 'vision'], reasoning_score: 0.85, coding_score: 0.83, math_score: 0.82, vision: true, cost_per_1m_input: 2.00, cost_per_1m_output: 10.00, latency_ms: 600, speed_tokens_per_sec: 60, gpu_requirement: null, ram_requirement: null, download_size: null, description: 'Grok-2 from xAI', tags: ['premium'] },
];

export function ModelManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const appMode = useChatStore((s) => s.appMode);

  let filtered = ALL_MODELS.filter((m) => {
    if (appMode === 'free' && m.tier === 'premium') return false;
    if (appMode === 'premium' && m.tier === 'local') return false;
    if (activeFilter === 'free') return m.tier === 'free';
    if (activeFilter === 'premium') return m.tier === 'premium';
    if (activeFilter === 'local') return m.tier === 'local';
    if (activeFilter !== 'all' && activeFilter !== 'free' && activeFilter !== 'premium' && activeFilter !== 'local') {
      if (activeFilter === 'open_source') return m.open_source;
      if (activeFilter === 'vision') return m.vision;
      if (activeFilter === 'fast') return (m.speed_tokens_per_sec || 0) > 100;
      if (activeFilter === 'cheap') return m.cost_per_1m_input < 1 && m.cost_per_1m_input > 0;
      if (activeFilter === 'long_context') return m.context_window >= 500000;
      return m.tags.includes(activeFilter) || m.capabilities.includes(activeFilter);
    }
    return true;
  });

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((m) =>
      m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || m.tags.some((t) => t.includes(q))
    );
  }

  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'reasoning': return b.reasoning_score - a.reasoning_score;
      case 'coding': return b.coding_score - a.coding_score;
      case 'speed': return (b.speed_tokens_per_sec || 0) - (a.speed_tokens_per_sec || 0);
      case 'cost': return a.cost_per_1m_input - b.cost_per_1m_input;
      case 'context': return b.context_window - a.context_window;
      default: return a.name.localeCompare(b.name);
    }
  });

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Model Manager</h1>
          <p className="text-sm text-gray-400">{filtered.length} models available · {appMode.toUpperCase()} mode</p>
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search models, providers, capabilities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder-gray-500"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-sm text-gray-300 outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Filter Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTER_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveFilter(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                activeFilter === tag
                  ? 'bg-violet-500/10 border-violet-500/30 text-violet-400'
                  : 'border-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {tag.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Model Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              selected={selectedModel === model.id}
              onSelect={setSelectedModel}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">No models match your filters</p>
            <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
