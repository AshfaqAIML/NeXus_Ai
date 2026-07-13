'use client';

import { useChatStore } from '@/store/chatStore';

export function RtkDashboardWidget() {
  const totalOriginal = useChatStore((s) => s.totalOriginalTokens);
  const totalCompressed = useChatStore((s) => s.totalCompressedTokens);

  if (totalOriginal === 0) return null;

  const saved = totalOriginal - totalCompressed;
  const percent = totalOriginal > 0 ? Math.round((saved / totalOriginal) * 100) : 0;
  const savedFormatted = saved.toLocaleString();
  const originalFormatted = totalOriginal.toLocaleString();
  const compressedFormatted = totalCompressed.toLocaleString();

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 text-[11px] font-mono">
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-gray-500">RTK</span>
      </div>
      <div className="flex items-center gap-1 text-gray-400">
        <span className="text-gray-500">In:</span>
        <span>{originalFormatted}</span>
      </div>
      <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
      </svg>
      <div className="flex items-center gap-1 text-gray-400">
        <span className="text-gray-500">Out:</span>
        <span>{compressedFormatted}</span>
      </div>
      {saved > 0 && (
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
          </svg>
          <span className="font-semibold">{percent}%</span>
          <span>saved</span>
        </div>
      )}
    </div>
  );
}
