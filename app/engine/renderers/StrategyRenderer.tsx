"use client";

export function StrategyRenderer() {
  return (
    <div className="grid grid-cols-10 grid-rows-6 w-full h-full bg-slate-300">
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} className="border bg-white" />
      ))}
    </div>
  );
}
