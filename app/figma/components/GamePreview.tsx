'use client';

import { GameConfig } from '@/app/types';

export function GamePreview({
  config,
  isDarkMode,
}: {
  config?: GameConfig;
  isDarkMode: boolean;
}) {
  return (
    <div
      className={`w-full h-full flex items-center justify-center text-sm ${
        isDarkMode ? 'text-slate-400' : 'text-slate-600'
      }`}
    >
      No game selected yet.
    </div>
  );
}
