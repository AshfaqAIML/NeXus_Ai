'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useChatStore } from '@/store/chatStore';
import { ChatMessage } from './ChatMessage';
import { PromptInput } from './PromptInput';
import { ModelSelector } from './ModelSelector';
import { RtkDashboardWidget } from '../context/RtkDashboardWidget';

interface ChatInterfaceProps {
  chatId: string;
  botId?: string;
  systemHint?: string;
}

export function ChatInterface({ chatId, botId = 'nexus', systemHint = '' }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const addMessage = useChatStore((s) => s.addMessage);
  const appendToLastMessage = useChatStore((s) => s.appendToLastMessage);
  const setStreaming = useChatStore((s) => s.setStreaming);
  const updateRtkMetrics = useChatStore((s) => s.updateRtkMetrics);
  const routerConfig = useChatStore((s) => s.routerConfig);
  const selectedModelId = useChatStore((s) => s.selectedModelId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamResponse = useCallback(async (userInput: string) => {
    setStreaming(true);

    const preferredModel = selectedModelId || routerConfig.preferredModel || 'auto';

    try {
      const res = await fetch('/api/messages/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: userInput,
          chat_id: chatId,
          preferred_model: preferredModel === 'auto' ? null : preferredModel,
          system_hint: systemHint || undefined,
        }),
      });

      if (!res.ok) {
        appendToLastMessage(`[Backend error: ${res.status} ${res.statusText}]`);
        setStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        appendToLastMessage('[Could not read response stream]');
        setStreaming(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'rtk_stats') {
              updateRtkMetrics(parsed.original, parsed.compressed);
            } else if (parsed.type === 'content') {
              appendToLastMessage(parsed.text);
            }
          } catch {}
        }
      }
    } catch (err: any) {
      appendToLastMessage(
        `[Connection error: ${err.message}. Make sure the backend is running on port 8002.]`
      );
    }

    setStreaming(false);
  }, [setStreaming, updateRtkMetrics, appendToLastMessage, routerConfig, selectedModelId, chatId, systemHint]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;

    const userText = input.trim();

    addMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: userText,
    });

    addMessage({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
    });

    setInput('');
    streamResponse(userText);
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a2e]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[65vh] text-center select-none">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mb-6 shadow-lg shadow-violet-500/25">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Nexus AI</h2>
              <p className="text-gray-400 text-base max-w-md mb-10">
                One Platform. Every AI Model. Smarter Context. Lower Cost.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
                {[
                  { icon: '💻', label: 'Write code', desc: 'A Python web scraper' },
                  { icon: '✍️', label: 'Write an essay', desc: 'About quantum computing' },
                  { icon: '📊', label: 'Analyze data', desc: 'From a CSV file' },
                  { icon: '🎨', label: 'Create content', desc: 'A marketing email' },
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setInput(`${s.label.toLowerCase()}: ${s.desc}`)}
                    className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-left group"
                  >
                    <span className="text-xl mt-0.5">{s.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-violet-300">{s.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{s.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                onEdit={msg.role === 'assistant' ? (content) => setInput(content) : undefined}
              />
            ))
          )}

          {isStreaming && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && messages[messages.length - 1].content === '' && (
            <div className="flex items-center gap-3 text-gray-400 text-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" />
              </div>
              Nexus AI is thinking...
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#1a1a2e] p-4">
        <div className="max-w-3xl mx-auto">
          <RtkDashboardWidget />
          <ModelSelector />
          <PromptInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
            disabled={isStreaming}
            placeholder={isStreaming ? 'Nexus is generating...' : 'Message Nexus AI...'}
          />
        </div>
      </div>
    </div>
  );
}
