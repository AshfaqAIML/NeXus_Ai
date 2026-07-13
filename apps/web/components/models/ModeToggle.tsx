'use client';

import { useChatStore, AppMode } from '@/store/chatStore';

const modes: { id: AppMode; label: string; icon: string; color: string; activeColor: string }[] = [
  { id: 'free', label: 'Free', icon: '🆓', color: 'text-emerald-400', activeColor: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
  { id: 'auto', label: 'Auto', icon: '⚡', color: 'text-violet-400', activeColor: 'bg-violet-500/10 border-violet-500/30 text-violet-400' },
  { id: 'premium', label: 'Premium', icon: '💎', color: 'text-amber-400', activeColor: 'bg-amber-500/10 border-amber-500/30 text-amber-400' },
];

export function ModeToggle() {
  const appMode = useChatStore((s) => s.appMode);
  const setAppMode = useChatStore((s) => s.setAppMode);

  return (
    <div className="flex items-center gap-1 p-0.5 rounded-xl bg-white/5 border border-white/5">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => setAppMode(mode.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
            appMode === mode.id
              ? mode.activeColor
              : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
          }`}
        >
          <span className="text-sm">{mode.icon}</span>
          {mode.label}
        </button>
      ))}
    </div>
  );
}
