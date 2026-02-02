import React, { useState } from 'react';
import { GameConfig } from '@/app/types';
import { SnakeGame } from './games/SnakeGame';
import { ClickerGame } from './games/ClickerGame';
import { TicTacToeGame } from './games/TicTacToeGame';
import { Zap, Move, CheckCircle, Info, MousePointer2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const GamePreview = ({ config, isDarkMode }: { config: GameConfig | undefined, isDarkMode: boolean }) => {
  const [hasStarted, setHasStarted] = useState(false);

  // Reset started state when config changes (new game generated)
  React.useEffect(() => {
    setHasStarted(false);
  }, [config]);

  const theme = {
    bg: isDarkMode ? 'bg-[#05080F]' : 'bg-slate-50',
    gridColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
    boxBg: isDarkMode ? 'bg-[#13171F]' : 'bg-white',
    boxBorder: isDarkMode ? 'border-white/5' : 'border-slate-200',
    iconColor: isDarkMode ? 'text-cyan-500/50' : 'text-blue-500/50',
    heading: isDarkMode ? 'text-slate-300' : 'text-slate-700',
    subheading: isDarkMode ? 'text-slate-500' : 'text-slate-400',
    overlayBg: isDarkMode ? 'bg-black/40' : 'bg-white/40',
    cardBg: isDarkMode ? 'bg-[#0B0E14]' : 'bg-white',
    cardBorder: isDarkMode ? 'border-white/10' : 'border-slate-200',
    blobColor: isDarkMode ? 'bg-cyan-500/20' : 'bg-blue-500/20',
    iconBoxBg: isDarkMode ? 'bg-[#151921]' : 'bg-slate-50',
    iconBoxBorder: isDarkMode ? 'border-white/5' : 'border-slate-200',
    accentText: isDarkMode ? 'text-cyan-400' : 'text-blue-600',
    startBtn: isDarkMode ? 'bg-cyan-500 hover:bg-cyan-400 text-[#05080F]' : 'bg-blue-600 hover:bg-blue-500 text-white',
    shadow: isDarkMode ? 'shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'shadow-lg',
  };

  if (!config || !config.type) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center ${theme.bg} text-slate-500 p-8 text-center relative overflow-hidden transition-colors duration-300`}>
        {/* Grid Background Effect */}
        <div 
          className="absolute inset-0 bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] pointer-events-none transition-colors duration-300"
          style={{ backgroundImage: `linear-gradient(${theme.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${theme.gridColor} 1px, transparent 1px)` }}
        ></div>
        
        <motion.div
           initial={{ scale: 0.9, opacity: 0.5 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
           className="relative z-10"
        >
          <div className={`w-24 h-24 rounded-2xl ${theme.boxBg} border ${theme.boxBorder} flex items-center justify-center mb-6 shadow-xl transition-colors duration-300`}>
             <Zap size={40} className={theme.iconColor} />
          </div>
        </motion.div>
        <h2 className={`text-xl font-bold mb-2 ${theme.heading} tracking-wide relative z-10 transition-colors duration-300`}>AWAITING INPUT</h2>
        <p className={`text-sm opacity-50 relative z-10 max-w-xs leading-relaxed ${theme.subheading}`}>Describe a game mechanic to the Forge Engine to begin materialization.</p>
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${theme.bg} relative overflow-hidden transition-colors duration-300`}>
      {/* Game Area */}
      <div className={`w-full h-full transition-opacity duration-500 ${!hasStarted ? 'opacity-20 blur-sm scale-95' : 'opacity-100 scale-100'}`}>
        {config.type === 'snake' && <SnakeGame config={config} />}
        {config.type === 'clicker' && <ClickerGame config={config} />}
        {config.type === 'tictactoe' && <TicTacToeGame config={config} />}
      </div>

      {/* How To Play Overlay */}
      <AnimatePresence>
        {!hasStarted && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className={`absolute inset-0 flex items-center justify-center z-50 p-6 backdrop-blur-sm ${theme.overlayBg} transition-colors duration-300`}
          >
            <div className={`w-full max-w-md ${theme.cardBg} border ${theme.cardBorder} rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-colors duration-300`}>
               {/* Decorative Gradient Blob */}
               <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 ${theme.blobColor} blur-[60px] rounded-full pointer-events-none`}></div>

               <div className="relative z-10 flex flex-col items-center text-center">
                  <div className={`w-12 h-12 ${theme.iconBoxBg} rounded-xl flex items-center justify-center mb-6 border ${theme.iconBoxBorder} shadow-lg ${theme.accentText}`}>
                    <Zap size={24} fill="currentColor" className={theme.accentText} />
                  </div>
                  
                  <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} tracking-tighter uppercase mb-1`}>How To Play</h2>
                  <div className={`text-[10px] font-bold ${theme.accentText} tracking-widest uppercase mb-8`}>Forge Engine v3.0</div>

                  <div className="w-full space-y-6 mb-8 text-left">
                    <div className="flex gap-4">
                      <div className={`mt-1 w-8 h-8 rounded-full ${theme.iconBoxBg} flex items-center justify-center shrink-0 border ${theme.iconBoxBorder}`}>
                        <Move size={14} className="text-slate-400" />
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'} uppercase tracking-wider mb-1`}>Controls</div>
                        <div className="text-xs text-slate-500 leading-relaxed">
                          Use Arrow Keys, WASD, or Touch/Swipe to move. Click to interact.
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className={`mt-1 w-8 h-8 rounded-full ${theme.iconBoxBg} flex items-center justify-center shrink-0 border ${theme.iconBoxBorder}`}>
                        <CheckCircle size={14} className="text-slate-400" />
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'} uppercase tracking-wider mb-1`}>Objective</div>
                        <div className="text-xs text-slate-500 leading-relaxed">
                          Avoid obstacles, collect points, and survive as long as possible to set a high score.
                        </div>
                      </div>
                    </div>

                     <div className="flex gap-4">
                      <div className={`mt-1 w-8 h-8 rounded-full ${theme.iconBoxBg} flex items-center justify-center shrink-0 border ${theme.iconBoxBorder}`}>
                        <Info size={14} className="text-slate-400" />
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'} uppercase tracking-wider mb-1`}>Pro Tip</div>
                        <div className="text-xs text-slate-500 leading-relaxed">
                          This build uses Adaptive Logic. It will scale to your screen size for optimal performance.
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setHasStarted(true)}
                    className={`w-full py-4 ${theme.startBtn} text-sm font-black tracking-widest uppercase rounded-xl ${theme.shadow} hover:shadow-xl transition-all transform hover:scale-[1.02]`}
                  >
                    Start Session
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
