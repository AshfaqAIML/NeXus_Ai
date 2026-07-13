'use client';

import { useState } from 'react';

export interface Bot {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  preferredModel: string | null; // null = auto route
  systemHint: string;
}

export const bots: Bot[] = [
  { id: 'nexus', name: 'Nexus AI', icon: '⚡', description: 'Multi-model smart router', color: 'from-violet-500 to-fuchsia-500', preferredModel: null, systemHint: '' },
  { id: 'coder', name: 'Nexus Coder', icon: '💻', description: 'Best free model for code', color: 'from-purple-500 to-pink-500', preferredModel: 'openai/gpt-oss-120b:free', systemHint: 'You are Nexus Coder, an expert programming assistant. Focus on writing clean, efficient, well-documented code. Always include code examples when relevant.' },
  { id: 'analyst', name: 'Nexus Analyst', icon: '📊', description: '120B model for reasoning', color: 'from-green-500 to-emerald-500', preferredModel: 'nvidia/nemotron-3-super-120b-a12b:free', systemHint: 'You are Nexus Analyst, an expert in data analysis, research, and logical reasoning. Provide structured analysis with clear evidence and step-by-step reasoning.' },
  { id: 'creative', name: 'Nexus Creative', icon: '🎨', description: 'For writing and creative work', color: 'from-orange-500 to-amber-500', preferredModel: 'google/gemma-4-31b-it:free', systemHint: 'You are Nexus Creative, a talented writing assistant. Help with essays, stories, emails, marketing copy, and creative content. Be expressive and engaging.' },
  { id: 'longctx', name: 'Nexus Long', icon: '📄', description: 'Handles long documents', color: 'from-red-500 to-rose-500', preferredModel: 'nvidia/nemotron-3-super-120b-a12b:free', systemHint: 'You are Nexus Long, specialized in analyzing long documents, research papers, and extensive text. Provide thorough, well-organized summaries and analysis.' },
];

interface BotSidebarProps {
  activeBot: string;
  onSelectBot: (id: string) => void;
  onNewChat: () => void;
}

export function BotSidebar({ activeBot, onSelectBot, onNewChat }: BotSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBots = bots.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="flex flex-col h-full w-72 bg-[#16162a] border-r border-white/5">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight">Nexus AI</div>
            <div className="text-[10px] text-gray-500">Multi-Model Platform</div>
          </div>
        </div>

        {/* New Chat */}
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-sm text-white font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5">
          <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search bots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder-gray-500"
          />
        </div>
      </div>

      {/* Bot List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-gray-500 font-medium">Bots</div>
        {filteredBots.map((bot) => (
          <button
            key={bot.id}
            onClick={() => onSelectBot(bot.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
              activeBot === bot.id
                ? 'bg-violet-500/10 text-white border border-violet-500/20'
                : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${bot.color} flex items-center justify-center text-sm flex-shrink-0`}>
              {bot.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{bot.name}</div>
              <div className="text-[11px] text-gray-500 truncate">{bot.description}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
            U
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white">User</div>
            <div className="text-[11px] text-gray-500">Free Plan</div>
          </div>
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      </div>
    </aside>
  );
}
