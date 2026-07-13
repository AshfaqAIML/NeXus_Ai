'use client';

export interface ModelData {
  id: string;
  name: string;
  provider: string;
  tier: string;
  version: string;
  context_window: number;
  parameters: string | null;
  license: string;
  open_source: boolean;
  capabilities: string[];
  reasoning_score: number;
  coding_score: number;
  math_score: number;
  vision: boolean;
  cost_per_1m_input: number;
  cost_per_1m_output: number;
  latency_ms: number | null;
  speed_tokens_per_sec: number | null;
  gpu_requirement: string | null;
  ram_requirement: string | null;
  download_size: string | null;
  description: string;
  tags: string[];
  available: boolean;
}

interface ModelCardProps {
  model: ModelData;
  onSelect?: (id: string) => void;
  selected?: boolean;
  compact?: boolean;
}

const providerLogos: Record<string, string> = {
  openai: '🟢', anthropic: '🟣', google: '🔴', deepseek: '🐋',
  openrouter: '🔀', groq: '⚡', together: '🤝', fireworks: '🎆',
  cerebras: '🧠', huggingface: '🤗', cloudflare: '☁️', ollama: '🦙',
  lmstudio: '🖥️', mistral: '🌊', xai: '✖️', cohere: '💎',
  azure: '☁️', bedrock: '📦', zhipu: '🔵', qwen: '🟠',
};

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score * 100}%` }} />
      </div>
      <span className="text-[10px] text-gray-500 w-6 text-right">{Math.round(score * 100)}</span>
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const styles: Record<string, string> = {
    free: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    premium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    local: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase ${styles[tier] || styles.free}`}>
      {tier}
    </span>
  );
}

export function ModelCard({ model, onSelect, selected, compact }: ModelCardProps) {
  if (compact) {
    return (
      <button
        onClick={() => onSelect?.(model.id)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all border ${
          selected
            ? 'bg-violet-500/10 border-violet-500/30 text-white'
            : 'border-transparent hover:bg-white/5 text-gray-300'
        }`}
      >
        <span className="text-lg">{providerLogos[model.provider] || '🤖'}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{model.name}</div>
          <div className="text-[11px] text-gray-500 truncate">
            {model.provider} · {model.context_window >= 1000000 ? `${model.context_window / 1000000}M` : `${model.context_window / 1000}K`} ctx
            {model.cost_per_1m_input === 0 && model.tier !== 'local' && ' · Free'}
          </div>
        </div>
        <TierBadge tier={model.tier} />
      </button>
    );
  }

  return (
    <div
      onClick={() => onSelect?.(model.id)}
      className={`group relative p-4 rounded-2xl border transition-all cursor-pointer ${
        selected
          ? 'bg-violet-500/10 border-violet-500/30 shadow-lg shadow-violet-500/10'
          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">
            {providerLogos[model.provider] || '🤖'}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{model.name}</div>
            <div className="text-xs text-gray-500">{model.provider} · {model.version}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {model.open_source && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">OSS</span>
          )}
          <TierBadge tier={model.tier} />
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-400 mb-3 line-clamp-2">{model.description}</p>

      {/* Scores */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-14">Reasoning</span>
          <ScoreBar score={model.reasoning_score} color="bg-violet-500" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-14">Coding</span>
          <ScoreBar score={model.coding_score} color="bg-blue-500" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-14">Math</span>
          <ScoreBar score={model.math_score} color="bg-emerald-500" />
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-2 text-[10px] text-gray-500">
        <span className="px-2 py-0.5 rounded bg-white/5">
          {model.context_window >= 1000000 ? `${model.context_window / 1000000}M` : `${model.context_window / 1000}K`} ctx
        </span>
        {model.parameters && <span className="px-2 py-0.5 rounded bg-white/5">{model.parameters}</span>}
        {model.latency_ms && <span className="px-2 py-0.5 rounded bg-white/5">{model.latency_ms}ms</span>}
        {model.vision && <span className="px-2 py-0.5 rounded bg-white/5">👁 Vision</span>}
        {model.cost_per_1m_input === 0 && model.tier !== 'local' && (
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">$0.00</span>
        )}
        {model.cost_per_1m_input > 0 && (
          <span className="px-2 py-0.5 rounded bg-white/5">${model.cost_per_1m_input}/1M in</span>
        )}
        {model.gpu_requirement && <span className="px-2 py-0.5 rounded bg-white/5">{model.gpu_requirement}</span>}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mt-3">
        {model.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-gray-500">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
