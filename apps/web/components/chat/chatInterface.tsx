'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useChatStore } from '@/store/chatStore';
import { ChatMessage } from './ChatMessage';
import { PromptInput } from './PromptInput';
import { ModelSelector } from './ModelSelector';

interface ChatInterfaceProps {
  chatId: string;
}

function extractTopic(input: string): string {
  const lower = input.replace(/^(what|who|how|why|when|where|which|is|are|was|were|can|could|would|should|do|does|did|tell|explain|describe|define|list|give|show|write|create|make)\s+(me\s+)?(about\s+)?/i, '').trim();
  if (lower.length < 3) return 'that topic';
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function getDemoResponse(input: string): string {
  const lower = input.toLowerCase();
  const topic = extractTopic(input);
  const isQuestion = /\?/.test(input) || /^(what|who|how|why|when|where|which|is|are|can|could|do|does)/i.test(input);
  const isCodeRequest = /\b(code|python|javascript|function|script|program|algorithm|implement|debug|fix|write.*code|api|html|css|react)\b/i.test(lower);
  const isMathRequest = /\b(math|calculate|equation|solve|formula|integral|derivative|probability|statistics|sum|average|mean|median)\b/i.test(lower);
  const isWritingRequest = /\b(essay|write|letter|email|story|article|blog|content|draft|summary|paraphrase)\b/i.test(lower);
  const isAnalysisRequest = /\b(analyze|analysis|compare|contrast|evaluate|explain why|reason|logic|research|data)\b/i.test(lower);

  if (isCodeRequest) {
    return `Here's an example for that:\n\n\`\`\`python\ndef solve():\n    """A simple demonstration."""\n    result = []\n    for i in range(10):\n        result.append(i ** 2)\n    return result\n\nprint(solve())\n# Output: [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]\n\`\`\`\n\nThis is a demo — connect your API keys in the **API Keys** page for real AI-powered code generation, or try a local model from the **Local AI** hub.\n\nWant me to modify this or show a different approach?`;
  }

  if (isMathRequest) {
    return `Here's a quick math breakdown:\n\nTo solve problems like **${topic}**, you'd typically:\n\n1. **Identify** the knowns and unknowns\n2. **Set up** the equation or formula\n3. **Solve** step by step\n4. **Verify** your answer\n\n\`\`\`\nExample: If x + 5 = 12\n  x = 12 - 5\n  x = 7  ✓\n\`\`\`\n\nThis is a demo — connect your API keys for real AI-powered math solving, or try a local model from the **Local AI** hub.\n\nWant me to work through a specific problem?`;
  }

  if (isWritingRequest) {
    return `Here's a draft on **${topic}**:\n\n---\n\n${topic} is a fascinating subject that has many applications in today's world. Understanding the core principles helps you make better decisions and communicate more effectively.\n\nKey points to consider:\n- The fundamentals and history\n- How it applies in practice\n- Common misconceptions\n- Future trends and developments\n\n---\n\nThis is a demo — connect your API keys in the **API Keys** page for real AI-generated content, or try a local model from the **Local AI** hub.\n\nWant me to expand on any specific aspect?`;
  }

  if (isAnalysisRequest) {
    return `Here's an analysis of **${topic}**:\n\n**Overview:**\n${topic} is a broad and important subject with significant implications across multiple domains.\n\n**Key Aspects:**\n1. **Historical context** — How it has evolved over time\n2. **Current state** — Where things stand today\n3. **Challenges** — Main obstacles and debates\n4. **Opportunities** — Where growth and innovation are happening\n\n**Summary:**\nUnderstanding ${topic.toLowerCase()} requires looking at multiple perspectives and staying up to date with the latest developments.\n\nThis is a demo — connect your API keys for real AI-powered analysis, or try a local model from the **Local AI** hub.\n\nWant me to dive deeper into any aspect?`;
  }

  if (isQuestion) {
    return `Great question about **${topic}**!\n\nHere's an overview:\n\n${topic} is an important and multifaceted subject. Here are the key things to know:\n\n**Definition:**\n${topic} refers to the study, practice, or understanding of a specific domain of knowledge or activity.\n\n**Why it matters:**\n- It helps us understand the world around us\n- It has practical applications in everyday life\n- It continues to evolve with new discoveries and insights\n\n**Key takeaway:**\nThe most important thing to understand about ${topic.toLowerCase()} is that it connects to many other fields and areas of study.\n\nThis is a demo — connect your API keys in the **API Keys** page for real AI-powered answers, or try a local model from the **Local AI** hub.\n\nWant me to go deeper into any specific aspect?`;
  }

  return `Thanks for your message about **${topic}**!\n\nI'd love to help with that. This is currently a demo response — to get real AI-powered answers:\n\n1. **Add API keys** — Go to the **API Keys** page and connect providers like OpenAI, Anthropic, or Google\n2. **Use local models** — Visit the **Local AI** hub to download and run models on your machine\n3. **Try free models** — Switch to **Free** mode in the top bar to use free-tier models via OpenRouter\n\nHere's what I can help with:\n- 💻 **Coding** — Write, debug, and explain code\n- ✍️ **Writing** — Essays, emails, creative content\n- 📊 **Analysis** — Data analysis, reasoning, math\n- 🔍 **Research** — Long-context analysis, document Q&A\n\nWhat would you like to try?`;
}

export function ChatInterface({ chatId }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const addMessage = useChatStore((s) => s.addMessage);
  const appendToLastMessage = useChatStore((s) => s.appendToLastMessage);
  const setStreaming = useChatStore((s) => s.setStreaming);
  const updateRtkMetrics = useChatStore((s) => s.updateRtkMetrics);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamResponse = useCallback(async (userInput: string) => {
    setStreaming(true);

    // Simulate RTK compression metrics
    const originalTokens = Math.floor(userInput.length / 4) + 20;
    const compressedTokens = Math.floor(originalTokens * 0.6);
    updateRtkMetrics(originalTokens, compressedTokens);

    // Simulate routing delay
    await new Promise((r) => setTimeout(r, 600));

    // Get demo response
    const responseText = getDemoResponse(userInput);
    const words = responseText.split(' ');

    // Stream word by word
    for (let i = 0; i < words.length; i++) {
      const chunk = (i === 0 ? '' : ' ') + words[i];
      appendToLastMessage(chunk);
      await new Promise((r) => setTimeout(r, 15 + Math.random() * 25));
    }

    setStreaming(false);
  }, [setStreaming, updateRtkMetrics, appendToLastMessage]);

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

    // Start streaming response
    streamResponse(userText);
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a2e]">
      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[65vh] text-center select-none">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mb-6 shadow-lg shadow-violet-500/25">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.75 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
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
              <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
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

      {/* Input Area */}
      <div className="border-t border-white/10 bg-[#1a1a2e] p-4">
        <div className="max-w-3xl mx-auto">
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
