'use client';

import { useState } from 'react';

interface LocalModel {
  id: string;
  name: string;
  size: string;
  quantization: string;
  ramRequired: string;
  gpuRequired: string;
  status: 'installed' | 'available' | 'downloading' | 'updating';
  progress?: number;
  speed: string;
}

const availableModels: LocalModel[] = [
  { id: 'llama-3.1-8b-q4', name: 'Llama 3.1 8B', size: '4.7 GB', quantization: 'Q4_K_M', ramRequired: '8 GB', gpuRequired: '4 GB VRAM', status: 'installed', speed: '~35 tok/s' },
  { id: 'qwen-2.5-7b-q4', name: 'Qwen 2.5 7B', size: '4.4 GB', quantization: 'Q4_K_M', ramRequired: '8 GB', gpuRequired: '4 GB VRAM', status: 'available', speed: '~40 tok/s' },
  { id: 'deepseek-coder-v2-q4', name: 'DeepSeek Coder V2', size: '8.9 GB', quantization: 'Q4_K_M', ramRequired: '16 GB', gpuRequired: '8 GB VRAM', status: 'available', speed: '~25 tok/s' },
  { id: 'mistral-7b-q4', name: 'Mistral 7B', size: '4.1 GB', quantization: 'Q4_K_M', ramRequired: '8 GB', gpuRequired: '4 GB VRAM', status: 'available', speed: '~45 tok/s' },
  { id: 'gemma-2-9b-q4', name: 'Gemma 2 9B', size: '5.4 GB', quantization: 'Q4_K_M', ramRequired: '8 GB', gpuRequired: '4 GB VRAM', status: 'available', speed: '~38 tok/s' },
  { id: 'phi-3.5-mini-q4', name: 'Phi-3.5 Mini', size: '2.2 GB', quantization: 'Q4_K_M', ramRequired: '4 GB', gpuRequired: '2 GB VRAM', status: 'available', speed: '~80 tok/s' },
  { id: 'codellama-13b-q4', name: 'Code Llama 13B', size: '7.4 GB', quantization: 'Q4_K_M', ramRequired: '12 GB', gpuRequired: '6 GB VRAM', status: 'available', speed: '~30 tok/s' },
  { id: 'starcoder2-15b-q4', name: 'StarCoder2 15B', size: '8.5 GB', quantization: 'Q4_K_M', ramRequired: '16 GB', gpuRequired: '8 GB VRAM', status: 'available', speed: '~28 tok/s' },
  { id: 'tinyllama-1.1b-q4', name: 'TinyLlama 1.1B', size: '0.6 GB', quantization: 'Q4_K_M', ramRequired: '2 GB', gpuRequired: 'None', status: 'installed', speed: '~200 tok/s' },
];

export function LocalModelHub() {
  const [models, setModels] = useState(availableModels);
  const [activeTab, setActiveTab] = useState<'installed' | 'available'>('installed');

  const installed = models.filter((m) => m.status === 'installed' || m.status === 'downloading');
  const available = models.filter((m) => m.status === 'available');

  const handleDownload = (id: string) => {
    setModels(models.map((m) =>
      m.id === id ? { ...m, status: 'downloading' as const, progress: 0 } : m
    ));
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setModels((prev) => prev.map((m) =>
          m.id === id ? { ...m, status: 'installed' as const, progress: 100 } : m
        ));
      } else {
        setModels((prev) => prev.map((m) =>
          m.id === id ? { ...m, progress: Math.round(progress) } : m
        ));
      }
    }, 500);
  };

  const handleDelete = (id: string) => {
    setModels(models.map((m) =>
      m.id === id ? { ...m, status: 'available' as const } : m
    ));
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Local AI Hub</h1>
          <p className="text-sm text-gray-400">Download and run models locally via Ollama</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/5 mb-6 w-fit">
          <button
            onClick={() => setActiveTab('installed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'installed' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Installed ({installed.length})
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'available' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Available ({available.length})
          </button>
        </div>

        {/* Model List */}
        <div className="space-y-3">
          {(activeTab === 'installed' ? installed : available).map((model) => (
            <div key={model.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center text-2xl">
                🦙
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{model.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500">{model.quantization}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>{model.size}</span>
                  <span>·</span>
                  <span>RAM: {model.ramRequired}</span>
                  <span>·</span>
                  <span>GPU: {model.gpuRequired}</span>
                  <span>·</span>
                  <span>{model.speed}</span>
                </div>
                {model.status === 'downloading' && model.progress !== undefined && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${model.progress}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1">{model.progress}%</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {model.status === 'installed' ? (
                  <>
                    <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Ready
                    </button>
                    <button
                      onClick={() => handleDelete(model.id)}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </>
                ) : model.status === 'downloading' ? (
                  <span className="text-xs text-violet-400 animate-pulse">Downloading...</span>
                ) : (
                  <button
                    onClick={() => handleDownload(model.id)}
                    className="px-4 py-1.5 rounded-lg text-xs font-medium bg-violet-600 hover:bg-violet-500 text-white transition-colors"
                  >
                    Download
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
