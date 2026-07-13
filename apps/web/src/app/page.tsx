'use client';

import { useState } from 'react';
import { useChatStore, ActivePage } from '@/store/chatStore';
import { ChatInterface } from '@/components/chat/chatInterface';
import { RTKDashboardWidget } from '@/components/context/RtkDashboardWidget';
import { ModeToggle } from '@/components/models/ModeToggle';
import { ModelManager } from '@/components/models/ModelManager';
import { ApiKeyManager } from '@/components/models/ApiKeyManager';
import { LocalModelHub } from '@/components/models/LocalModelHub';
import { BenchmarkDashboard } from '@/components/models/BenchmarkDashboard';
import { BotSidebar, bots } from '@/components/sidebar/BotSidebar';

const navItems: { id: ActivePage; label: string; icon: string }[] = [
  { id: 'chat', label: 'Chat', icon: '💬' },
  { id: 'models', label: 'Models', icon: '🧠' },
  { id: 'api-keys', label: 'API Keys', icon: '🔑' },
  { id: 'local-models', label: 'Local AI', icon: '🦙' },
  { id: 'benchmarks', label: 'Benchmarks', icon: '📊' },
];

export default function Home() {
  const [chatId, setChatId] = useState(() => crypto.randomUUID());
  const activePage = useChatStore((s) => s.activePage);
  const setActivePage = useChatStore((s) => s.setActivePage);
  const activeBot = useChatStore((s) => s.activeBot);
  const setActiveBot = useChatStore((s) => s.setActiveBot);
  const selectedModelId = useChatStore((s) => s.selectedModelId);
  const setSelectedModelId = useChatStore((s) => s.setSelectedModelId);
  const sidebarOpen = useChatStore((s) => s.sidebarOpen);
  const setSidebarOpen = useChatStore((s) => s.setSidebarOpen);
  const clearMessages = useChatStore((s) => s.clearMessages);

  const handleSelectBot = (id: string) => {
    setActiveBot(id);
    setActivePage('chat');
    clearMessages();
    setChatId(crypto.randomUUID());
    const bot = bots.find((b) => b.id === id);
    if (bot?.preferredModel) {
      setSelectedModelId(bot.preferredModel);
    }
  };

  const handleNewChat = () => {
    clearMessages();
    setChatId(crypto.randomUUID());
  };

  const currentBot = bots.find((b) => b.id === activeBot);

  const renderPage = () => {
    switch (activePage) {
      case 'models': return <ModelManager />;
      case 'api-keys': return <ApiKeyManager />;
      case 'local-models': return <LocalModelHub />;
      case 'benchmarks': return <BenchmarkDashboard />;
      default: return (
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-hidden">
            <ChatInterface
              chatId={chatId}
              botId={activeBot}
              systemHint={currentBot?.systemHint || ''}
            />
          </div>
          <RTKDashboardWidget />
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0f0f23]">
      {/* Bot Sidebar */}
      {sidebarOpen && (
        <BotSidebar activeBot={activeBot} onSelectBot={handleSelectBot} onNewChat={handleNewChat} />
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#0f0f23]/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {/* Active Bot Indicator */}
            {currentBot && (
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${currentBot.color} flex items-center justify-center text-sm`}>
                  {currentBot.icon}
                </div>
                <span className="text-sm font-semibold text-white">{currentBot.name}</span>
                <span className="text-xs text-gray-500 hidden sm:inline">— {currentBot.description}</span>
              </div>
            )}
            {!currentBot && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">Nexus AI</span>
              </div>
            )}

            {/* Page Navigation */}
            <nav className="flex items-center gap-1 ml-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activePage === item.id
                      ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <ModeToggle />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer">
              U
            </div>
          </div>
        </div>

        {/* Page Content */}
        {renderPage()}
      </div>
    </div>
  );
}
