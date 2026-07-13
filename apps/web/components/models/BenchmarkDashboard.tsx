'use client';

const benchmarkData = [
  { name: 'GPT-4o', provider: 'OpenAI', logo: '🟢', reasoning: 92, coding: 90, math: 92, speed: 80, cost: 2.50, context: '128K', latency: 500, tier: 'premium' },
  { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', logo: '🟣', reasoning: 92, coding: 95, math: 88, speed: 70, cost: 3.00, context: '200K', latency: 600, tier: 'premium' },
  { name: 'o1', provider: 'OpenAI', logo: '🟢', reasoning: 98, coding: 93, math: 98, speed: 30, cost: 15.00, context: '200K', latency: 10000, tier: 'premium' },
  { name: 'Gemini 2.0 Flash', provider: 'Google', logo: '🔴', reasoning: 85, coding: 83, math: 82, speed: 250, cost: 0.10, context: '1M', latency: 250, tier: 'premium' },
  { name: 'DeepSeek Chat V3', provider: 'DeepSeek', logo: '🐋', reasoning: 88, coding: 92, math: 90, speed: 60, cost: 0.00, context: '128K', latency: 800, tier: 'free' },
  { name: 'DeepSeek R1', provider: 'DeepSeek', logo: '🐋', reasoning: 95, coding: 90, math: 95, speed: 30, cost: 0.00, context: '128K', latency: 5000, tier: 'free' },
  { name: 'Llama 3.1 70B', provider: 'Groq', logo: '⚡', reasoning: 82, coding: 84, math: 80, speed: 180, cost: 0.00, context: '128K', latency: 300, tier: 'free' },
  { name: 'Qwen 2.5 72B', provider: 'OpenRouter', logo: '🔀', reasoning: 85, coding: 88, math: 87, speed: 50, cost: 0.00, context: '128K', latency: 600, tier: 'free' },
  { name: 'Gemma 2 27B', provider: 'OpenRouter', logo: '🔀', reasoning: 78, coding: 80, math: 75, speed: 100, cost: 0.00, context: '8K', latency: 400, tier: 'free' },
];

function Bar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <span className="text-[10px] text-gray-400 w-8 text-right">{value}</span>
    </div>
  );
}

export function BenchmarkDashboard() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Model Benchmarks</h1>
          <p className="text-sm text-gray-400">Compare models across key metrics</p>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-white/5 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 bg-white/[0.03] border-b border-white/5 text-[10px] uppercase tracking-wider text-gray-500 font-medium">
            <span>Model</span>
            <span>Reasoning</span>
            <span>Coding</span>
            <span>Math</span>
            <span>Speed</span>
            <span>Cost/1M</span>
            <span>Context</span>
            <span>Latency</span>
            <span>Tier</span>
          </div>

          {/* Rows */}
          {benchmarkData.sort((a, b) => b.reasoning - a.reasoning).map((model, i) => (
            <div key={model.name} className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 items-center hover:bg-white/[0.02] transition-colors ${i < benchmarkData.length - 1 ? 'border-b border-white/5' : ''}`}>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg">{model.logo}</span>
                <div>
                  <div className="text-xs font-medium text-white truncate">{model.name}</div>
                  <div className="text-[10px] text-gray-500">{model.provider}</div>
                </div>
              </div>
              <Bar value={model.reasoning} color="bg-violet-500" />
              <Bar value={model.coding} color="bg-blue-500" />
              <Bar value={model.math} color="bg-emerald-500" />
              <Bar value={model.speed} max={300} color="bg-amber-500" />
              <span className="text-xs text-gray-300">
                {model.cost === 0 ? <span className="text-emerald-400">Free</span> : `$${model.cost}`}
              </span>
              <span className="text-xs text-gray-300">{model.context}</span>
              <span className="text-xs text-gray-300">{model.latency}ms</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full w-fit ${
                model.tier === 'premium' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
              }`}>{model.tier}</span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 text-[10px] text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500" /> Reasoning</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Coding</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Math</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Speed (tok/s)</span>
        </div>
      </div>
    </div>
  );
}
