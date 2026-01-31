
import React from 'react';

interface GameInstructionsProps {
  title: string;
  onStart: () => void;
}

const GameInstructions: React.FC<GameInstructionsProps> = ({ title, onStart }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="max-w-md w-full glass rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-2xl flex flex-col text-center">
        <div className="mb-8">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/20 text-sky-500 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase mb-2">
            How to Play
          </h2>
          <p className="text-sky-500 font-bold text-sm uppercase tracking-widest">{title}</p>
        </div>

        <div className="space-y-6 text-left mb-10">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Controls</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">Use Arrow Keys, WASD, or Touch/Swipe to move. Click to interact.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Objective</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">Avoid obstacles, collect points, and survive as long as possible to set a high score.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Pro Tip</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">This build uses Adaptive Logic. It will scale to your screen size for optimal performance.</p>
            </div>
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full py-5 bg-sky-500 hover:bg-sky-400 text-white font-black rounded-2xl shadow-xl shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-sm"
        >
          Start Session
        </button>
      </div>
    </div>
  );
};

export default GameInstructions;
