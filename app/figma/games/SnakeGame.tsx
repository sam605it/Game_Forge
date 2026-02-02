import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { GameConfig } from '@/app/types';
import { RefreshCw, Trophy } from 'lucide-react';

// Simple button component to avoid dependency issues if not present
const SimpleButton = ({ children, onClick, className }: { children: React.ReactNode; onClick: () => void; className?: string }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer ${className}`}
  >
    {children}
  </button>
);

const GRID_SIZE = 20;

export const SnakeGame = ({ config }: { config: GameConfig }) => {
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // Theme colors
  const getColors = () => {
    switch (config.theme) {
      case 'retro': return { bg: 'bg-yellow-100', snake: 'bg-green-600', food: 'bg-red-600', text: 'text-green-800' };
      case 'cyberpunk': return { bg: 'bg-slate-900', snake: 'bg-cyan-400', food: 'bg-pink-500', text: 'text-cyan-400 shadow-neon' };
      case 'forest': return { bg: 'bg-emerald-900', snake: 'bg-emerald-400', food: 'bg-amber-400', text: 'text-emerald-100' };
      default: return { bg: 'bg-[#151921]', snake: 'bg-cyan-500', food: 'bg-rose-500', text: 'text-slate-200' };
    }
  };
  const colors = getColors();

  // Speed based on difficulty
  const getSpeed = () => {
    switch (config.difficulty) {
      case 'hard': return 50;
      case 'medium': return 100;
      case 'easy': default: return 150;
    }
  };

  const initGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) });
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
    setIsPlaying(true);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (direction !== 'DOWN') setDirection('UP'); break;
        case 'ArrowDown': if (direction !== 'UP') setDirection('DOWN'); break;
        case 'ArrowLeft': if (direction !== 'RIGHT') setDirection('LEFT'); break;
        case 'ArrowRight': if (direction !== 'LEFT') setDirection('RIGHT'); break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction]);

  useEffect(() => {
    if (!isPlaying) return;

    gameLoopRef.current = setInterval(() => {
      setSnake((prev) => {
        const head = { ...prev[0] };
        switch (direction) {
          case 'UP': head.y -= 1; break;
          case 'DOWN': head.y += 1; break;
          case 'LEFT': head.x -= 1; break;
          case 'RIGHT': head.x += 1; break;
        }

        // Check collision
        if (
          head.x < 0 || head.x >= GRID_SIZE ||
          head.y < 0 || head.y >= GRID_SIZE ||
          prev.some(segment => segment.x === head.x && segment.y === head.y)
        ) {
          setGameOver(true);
          setIsPlaying(false);
          return prev;
        }

        const newSnake = [head, ...prev];
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 1);
          setFood({ x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) });
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, getSpeed());

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPlaying, direction, food, config.difficulty]);

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center p-4 ${colors.bg}`}>
      <div className={`mb-4 flex items-center gap-4 ${colors.text}`}>
        <div className="flex items-center gap-2 text-2xl font-bold">
          <Trophy size={24} />
          {score}
        </div>
        {gameOver && <span className="text-red-500 font-bold animate-pulse">GAME OVER</span>}
      </div>

      <div 
        className="relative bg-black/10 rounded-lg overflow-hidden border-4 border-current"
        style={{ width: '300px', height: '300px', color: config.primaryColor || 'currentColor' }}
      >
        {snake.map((segment, i) => (
          <div
            key={`${segment.x}-${segment.y}-${i}`}
            className={`absolute w-[15px] h-[15px] rounded-sm ${colors.snake}`}
            style={{ left: segment.x * 15, top: segment.y * 15 }}
          />
        ))}
        <div
          className={`absolute w-[15px] h-[15px] rounded-full ${colors.food} animate-pulse`}
          style={{ left: food.x * 15, top: food.y * 15 }}
        />
        
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <SimpleButton onClick={initGame} className="bg-white text-black hover:bg-gray-200">
              Start Game
            </SimpleButton>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 gap-4">
             <SimpleButton onClick={initGame} className="bg-white text-black hover:bg-gray-200 flex items-center gap-2">
              <RefreshCw size={16} /> Try Again
            </SimpleButton>
          </div>
        )}
      </div>
      
      <div className={`mt-4 text-sm opacity-70 ${colors.text}`}>
        Use Arrow Keys to Move
      </div>
    </div>
  );
};
