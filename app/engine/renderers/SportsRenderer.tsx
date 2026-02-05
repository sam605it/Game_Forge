"use client";

export function SportsRenderer() {
  return (
    <div className="relative w-full h-full bg-green-500 rounded-lg">
      <div className="absolute left-10 top-1/2 text-3xl">🏀</div>
      <div className="absolute right-10 top-1/2 text-3xl">🥅</div>
      <div className="absolute bottom-2 left-2 text-xs">Sports Game</div>
    </div>
  );
}
