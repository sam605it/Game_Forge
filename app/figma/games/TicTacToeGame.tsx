import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GameConfig } from '@/app/types';
import { RefreshCcw, X, Circle } from 'lucide-react';

export const TicTacToeGame = ({ config }: { config: GameConfig }) => {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);

  const themeStyles = () => {
    switch (config.theme) {
      case 'cyberpunk': return {
        bg: 'bg-zinc-950',
        line: 'bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.8)]',
        x: 'text-cyan-400',
        o: 'text-yellow-400',
        text: 'text-pink-500'
      };
      case 'retro': return {
        bg: 'bg-orange-50',
        line: 'bg-orange-900',
        x: 'text-red-600',
        o: 'text-blue-600',
        text: 'text-orange-900'
      };
      default: return {
        bg: 'bg-[#151921]',
        line: 'bg-white/10',
        x: 'text-cyan-400',
        o: 'text-rose-500',
        text: 'text-slate-200'
      };
    }
  };
  const styles = themeStyles();

  const checkWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (i: number) => {
    if (board[i] || winner) return;
    const newBoard = [...board];
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
    setWinner(checkWinner(newBoard));
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  // AI Opponent (Simple Random if difficulty is easy, otherwise blocks)
  useEffect(() => {
    if (!isXNext && !winner && config.difficulty !== 'hard') {
      // Very simple AI: random move
      const emptyIndices = board.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];
      if (emptyIndices.length > 0) {
        const randomIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        setTimeout(() => handleClick(randomIdx), 500);
      }
    }
    // TODO: Hard AI
  }, [isXNext, winner, board]);

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center p-8 ${styles.bg} ${styles.text}`}>
      <h2 className="text-4xl font-bold mb-8 tracking-tighter">Tic Tac Toe</h2>
      
      <div className="relative">
        <div className="grid grid-cols-3 gap-0">
          {board.map((cell, i) => (
            <div
              key={i}
              onClick={() => handleClick(i)}
              className={`w-24 h-24 flex items-center justify-center text-5xl cursor-pointer hover:bg-black/5 transition-colors
                ${i % 3 !== 2 ? `border-r-4 ${styles.line.replace('bg-', 'border-').split(' ')[0]}` : ''}
                ${i < 6 ? `border-b-4 ${styles.line.replace('bg-', 'border-').split(' ')[0]}` : ''}
              `}
              style={{ borderColor: styles.line.includes('bg-') ? undefined : '' }} // Tailwind dynamic class workaround
            >
              <AnimatePresence mode="popLayout">
                {cell === 'X' && (
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className={styles.x}
                  >
                    <X size={64} strokeWidth={3} />
                  </motion.div>
                )}
                {cell === 'O' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={styles.o}
                  >
                    <Circle size={56} strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        
        {/* Custom Grid Lines because border logic is messy */}
        <div className={`absolute top-1/3 left-0 w-full h-1 ${styles.line}`} />
        <div className={`absolute top-2/3 left-0 w-full h-1 ${styles.line}`} />
        <div className={`absolute left-1/3 top-0 h-full w-1 ${styles.line}`} />
        <div className={`absolute left-2/3 top-0 h-full w-1 ${styles.line}`} />
      </div>

      <div className="mt-8 h-12">
        {winner ? (
          <motion.div
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             className="flex flex-col items-center gap-2"
          >
            <span className="text-2xl font-bold">{winner} Wins!</span>
            <button onClick={resetGame} className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-bold hover:scale-105 transition-transform">
              <RefreshCcw size={14} /> Play Again
            </button>
          </motion.div>
        ) : (
          <div className="text-xl font-medium opacity-60">
            {isXNext ? "Player X's Turn" : "Player O's Turn"}
          </div>
        )}
      </div>
    </div>
  );
};
