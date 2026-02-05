"use client";

export function PlatformerRenderer() {
  return (
    <div className="relative w-full h-full bg-sky-300">
      <div className="absolute bottom-0 w-full h-20 bg-green-700" />
      <div className="absolute bottom-24 left-8 text-3xl">🧍</div>
      <div className="absolute bottom-24 right-8 text-3xl">⭐</div>
    </div>
  );
}
