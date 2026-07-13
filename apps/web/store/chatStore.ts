import { create } from 'zustand';
import { Message, RouterConfig } from '@/types/api';

export type AppMode = 'free' | 'premium' | 'auto';
export type ActivePage = 'chat' | 'models' | 'api-keys' | 'local-models' | 'benchmarks';

interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  routerConfig: RouterConfig;
  totalOriginalTokens: number;
  totalCompressedTokens: number;
  appMode: AppMode;
  activePage: ActivePage;
  activeBot: string;
  selectedModelId: string | null;
  sidebarOpen: boolean;

  addMessage: (message: Message) => void;
  clearMessages: () => void;
  appendToLastMessage: (chunk: string) => void;
  updateRtkMetrics: (original: number, compressed: number) => void;
  setStreaming: (isStreaming: boolean) => void;
  setRouterConfig: (config: Partial<RouterConfig>) => void;
  setAppMode: (mode: AppMode) => void;
  setActivePage: (page: ActivePage) => void;
  setActiveBot: (id: string) => void;
  setSelectedModel: (id: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  routerConfig: {
    autoRoute: true,
    preferredModel: null,
  },
  totalOriginalTokens: 0,
  totalCompressedTokens: 0,
  appMode: 'auto',
  activePage: 'chat',
  activeBot: 'nexus',
  selectedModelId: null,
  sidebarOpen: true,

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  clearMessages: () =>
    set({ messages: [], totalOriginalTokens: 0, totalCompressedTokens: 0 }),

  appendToLastMessage: (chunk) =>
    set((state) => {
      const messages = [...state.messages];
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        lastMessage.content += chunk;
        return { messages: [...messages] };
      }
      return state;
    }),

  updateRtkMetrics: (original, compressed) =>
    set((state) => ({
      totalOriginalTokens: state.totalOriginalTokens + original,
      totalCompressedTokens: state.totalCompressedTokens + compressed,
    })),

  setStreaming: (isStreaming) => set({ isStreaming }),
  setRouterConfig: (config) =>
    set((state) => ({ routerConfig: { ...state.routerConfig, ...config } })),
  setAppMode: (appMode) => set({ appMode }),
  setActivePage: (activePage) => set({ activePage }),
  setActiveBot: (activeBot) => set({ activeBot }),
  setSelectedModel: (selectedModelId) => set({ selectedModelId }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));
