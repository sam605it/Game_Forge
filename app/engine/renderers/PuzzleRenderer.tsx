"use client";

export function PuzzleRenderer() {
  return (
    <div className="grid grid-cols-5 grid-rows-5 gap-1 w-full h-full p-4 bg-slate-100">
      {Array.from({ length: 25 }).map((_, i) => (
        <div
          key={i}
          className="bg-white border flex items-center justify-center"
        >
          🧩
        </div>
      ))}
    </div>
  );
}
