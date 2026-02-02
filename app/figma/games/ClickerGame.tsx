import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameConfig } from '@/app/types';
import { MousePointer2, Zap, Trophy, Sparkles } from 'lucide-react';

export const ClickerGame = ({ config }: { config: GameConfig }) => {
  const [score, setScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [autoClickers, setAutoClickers] = useState(0);
  const [particles, setParticles] = useState<{ id: number, x: number, y: number, val: number }[]>([]);

  // Theme configuration
  const themeStyles = () => {
    switch (config.theme) {
      case 'cyberpunk': return {
        bg: 'bg-slate-900',
        text: 'text-pink-500',
        btn: 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.7)] hover:shadow-[0_0_25px_rgba(6,182,212,1)]',
        card: 'bg-slate-800 border-pink-500/30'
      };
      case 'forest': return {
        bg: 'bg-stone-900',
        text: 'text-emerald-400',
        btn: 'bg-amber-600 hover:bg-amber-500',
        card: 'bg-stone-800 border-emerald-500/30'
      };
      case 'retro': return {
        bg: 'bg-blue-900',
        text: 'text-yellow-400',
        btn: 'bg-red-500 border-b-4 border-red-700 active:border-b-0 active:translate-y-1',
        card: 'bg-blue-800 border-white'
      };
      default: return {
        bg: 'bg-[#151921]',
        text: 'text-slate-200',
        btn: 'bg-cyan-500 hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]',
        card: 'bg-[#151921] border-white/10 text-slate-200 shadow-sm'
      };
    }
  };
  const styles = themeStyles();

  // Auto clicker logic
  useEffect(() => {
    if (autoClickers === 0) return;
    const interval = setInterval(() => {
      setScore(s => s + autoClickers);
    }, 1000);
    return () => clearInterval(interval);
  }, [autoClickers]);

  const handleClick = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Add particle
    const id = Date.now();
    setParticles(p => [...p, { id, x, y, val: multiplier }]);
    setTimeout(() => setParticles(p => p.filter(particle => particle.id !== id)), 1000);

    setScore(s => s + multiplier);
  };

  const upgradeCost = (level: number) => Math.floor(10 * Math.pow(1.5, level));
  const autoClickerCost = (count: number) => Math.floor(50 * Math.pow(1.5, count));

  return (
    <div className={`w-full h-full flex flex-col items-center p-6 ${styles.bg} ${styles.text} transition-colors duration-300`}>
      <header className="w-full flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black uppercase tracking-wider">Clicker</h2>
        <div className="flex items-center gap-2 text-xl font-bold">
          <Trophy className="w-6 h-6" />
          <span>{score.toLocaleString()}</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md gap-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleClick}
          className={`relative w-48 h-48 rounded-full flex items-center justify-center text-4xl font-bold text-white transition-all ${styles.btn}`}
        >
          <MousePointer2 size={64} />
          <AnimatePresence>
            {particles.map(p => (
              <motion.span
                key={p.id}
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -50 }}
                exit={{ opacity: 0 }}
                className="absolute text-2xl font-bold pointer-events-none"
                style={{ left: p.x, top: p.y }}
              >
                +{p.val}
              </motion.span>
            ))}
          </AnimatePresence>
        </motion.button>

        <div className="grid grid-cols-2 gap-4 w-full">
          <button
            onClick={() => {
              if (score >= upgradeCost(multiplier)) {
                setScore(s => s - upgradeCost(multiplier));
                setMultiplier(m => m + 1);
              }
            }}
            disabled={score < upgradeCost(multiplier)}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${styles.card}`}
          >
            <Zap className="w-8 h-8" />
            <div className="text-center">
              <div className="font-bold">Power Up</div>
              <div className="text-xs opacity-70">Cost: {upgradeCost(multiplier)}</div>
            </div>
          </button>

          <button
             onClick={() => {
              if (score >= autoClickerCost(autoClickers)) {
                setScore(s => s - autoClickerCost(autoClickers));
                setAutoClickers(a => a + 1);
              }
            }}
            disabled={score < autoClickerCost(autoClickers)}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${styles.card}`}
          >
            <Sparkles className="w-8 h-8" />
            <div className="text-center">
              <div className="font-bold">Auto Bot</div>
              <div className="text-xs opacity-70">Cost: {autoClickerCost(autoClickers)}</div>
            </div>
          </button>
        </div>
        
        <div className="text-center text-sm opacity-60">
          Multiplier: x{multiplier} | Auto: {autoClickers}/s
        </div>
      </div>
    </div>
  );
};
