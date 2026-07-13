import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useChatStore } from '@/store/chatStore';

export const useChatSocket = (chatId: string) => {
  const addMessage = useChatStore((s) => s.addMessage);
  const appendToLastMessage = useChatStore((s) => s.appendToLastMessage);
  const updateRtkMetrics = useChatStore((s) => s.updateRtkMetrics);
  const setStreaming = useChatStore((s) => s.setStreaming);

  useEffect(() => {
    const socket: Socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      query: { chatId },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Connected to Nexus WS');
    });

    // Listen for RTK compression stats BEFORE the LLM streams
    socket.on('rtk_stats', (data: { original: number; compressed: number }) => {
      updateRtkMetrics(data.original, data.compressed);
    });

    // Listen for the start of LLM streaming
    socket.on('llm_start', () => {
      addMessage({ id: crypto.randomUUID(), role: 'assistant', content: '' });
      setStreaming(true);
    });

    // Listen for streamed chunks
    socket.on('llm_chunk', (chunk: string) => {
      appendToLastMessage(chunk);
    });

    // Listen for completion or errors
    socket.on('llm_end', () => setStreaming(false));
    socket.on('error', (err: unknown) => {
      console.error('WS Error:', err);
      setStreaming(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [chatId, addMessage, appendToLastMessage, updateRtkMetrics, setStreaming]);
};