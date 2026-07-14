'use client';

import * as Switch from '@radix-ui/react-switch';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Label from '@radix-ui/react-label';
import { Zap, Info } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';

export function RtkToggle() {
  const rtkEnabled = useChatStore((s) => s.rtkEnabled);
  const toggleRtk = useChatStore((s) => s.toggleRtk);

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="flex items-center gap-2">
        <Switch.Root
          id="rtk-toggle"
          checked={rtkEnabled}
          onCheckedChange={toggleRtk}
          className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a2e] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-violet-500 data-[state=unchecked]:bg-white/10"
        >
          <Switch.Thumb className="pointer-events-none block h-3.5 w-3.5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0.5" />
        </Switch.Root>

        <Label.Root
          htmlFor="rtk-toggle"
          className="flex items-center gap-1 text-xs text-gray-400 cursor-pointer select-none hover:text-gray-300 transition-colors"
        >
          <Zap className="w-3 h-3 text-yellow-500" />
          <span>RTK</span>
        </Label.Root>

        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button className="text-gray-500 hover:text-gray-300 transition-colors">
              <Info className="w-3 h-3" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="top"
              sideOffset={4}
              className="z-50 max-w-[260px] rounded-xl border border-white/10 bg-[#16162a] px-3 py-2.5 text-xs text-gray-300 shadow-xl"
            >
              <p>
                <span className="font-semibold text-yellow-400">ON:</span>{' '}
                Saves 60-90% tokens by compressing logs, code, and history. Best for cost and large contexts.
              </p>
              <p className="mt-1.5">
                <span className="font-semibold text-gray-400">OFF:</span>{' '}
                Sends raw context. Best for exact string matching or absolute fidelity.
              </p>
              <Tooltip.Arrow className="fill-[#16162a]" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>
    </Tooltip.Provider>
  );
}
