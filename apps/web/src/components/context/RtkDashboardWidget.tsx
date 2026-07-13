'use client';

import { useChatStore } from '@/store/chatStore';
import { Sparkles, TrendingDown, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function RTKDashboardWidget() {
  const totalOriginal = useChatStore((s) => s.totalOriginalTokens);
  const totalCompressed = useChatStore((s) => s.totalCompressedTokens);
  
  // Calculate percentage saved
  const saved = totalOriginal > 0 ? Math.round(((totalOriginal - totalCompressed) / totalOriginal) * 100) : 0;
  const isOptimizing = totalOriginal > 0;

  return (
    <AnimatePresence>
      {isOptimizing && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="absolute bottom-4 right-4 z-50 w-64"
        >
          <div className="rounded-xl border bg-card/80 backdrop-blur-lg shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-yellow-500" />
                RTK Engine Active
              </span>
              <span className="text-xs font-bold text-green-500">{saved}% Saved</span>
            </div>
            
            {/* Token Visualization Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                <span>Original</span>
                <span>{totalOriginal.toLocaleString()} tok</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-red-500/50" style={{ width: '100%' }} />
              </div>
              
              <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                <span>Compressed</span>
                <span>{totalCompressed.toLocaleString()} tok</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-green-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(totalCompressed / totalOriginal) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 pt-1 border-t">
              <TrendingDown className="w-3 h-3 text-green-500" />
              <span className="text-[10px] text-muted-foreground">
                Est. cost reduced by <span className="font-bold text-foreground">${((totalOriginal - totalCompressed) * 0.000005).toFixed(4)}</span>
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}