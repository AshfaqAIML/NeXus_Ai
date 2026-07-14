'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/store/chatStore';

const models = [
  { id: 'auto', name: 'Auto Route', icon: '⚡', desc: 'Smart routing to best free model' },
  { id: 'google/gemma-4-31b-it:free', name: 'Gemma 4 31B', icon: '🟢', desc: 'Google\'s latest (free)' },
  { id: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'Nemotron 3 Super 120B', icon: '🟢', desc: 'NVIDIA\'s largest (free)' },
  { id: 'openai/gpt-oss-120b:free', name: 'GPT-OSS 120B', icon: '🟢', desc: 'OpenAI open-source (free)' },
  { id: 'qwen/qwen3-next-80b-a3b-instruct:free', name: 'Qwen3 Next 80B', icon: '🟢', desc: 'Alibaba reasoning (free)' },
];

export function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const routerConfig = useChatStore((s) => s.routerConfig);
  const setRouterConfig = useChatStore((s) => s.setRouterConfig);
  const setSelectedModel = useChatStore((s) => s.setSelectedModel);

  const selectedModel = models.find((m) =>
    routerConfig.preferredModel ? m.id === routerConfig.preferredModel : m.id === 'auto'
  ) || models[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
      >
        <span>{selectedModel.icon}</span>
        <span className="font-medium">{selectedModel.name}</span>
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-72 bg-[#252540] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="p-2 border-b border-white/10">
            <div className="text-[10px] uppercase tracking-wider text-gray-500 px-2 py-1">Free Models (OpenRouter)</div>
          </div>
          <div className="p-1 max-h-64 overflow-y-auto">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  setRouterConfig({
                    autoRoute: model.id === 'auto',
                    preferredModel: model.id === 'auto' ? null : model.id,
                  });
                  setSelectedModel(model.id === 'auto' ? null : model.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  (routerConfig.preferredModel === model.id || (model.id === 'auto' && routerConfig.autoRoute))
                    ? 'bg-violet-500/10 text-white'
                    : 'hover:bg-white/5 text-gray-300'
                }`}
              >
                <span className="text-lg">{model.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{model.name}</div>
                  <div className="text-xs text-gray-500 truncate">{model.desc}</div>
                </div>
                {(routerConfig.preferredModel === model.id || (model.id === 'auto' && routerConfig.autoRoute)) && (
                  <svg className="w-4 h-4 text-violet-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
