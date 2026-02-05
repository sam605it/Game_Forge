"use client";

import FigmaApp from "@/app/figma/App";

function BunnyIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Bunny icon"
      role="img"
    >
      <ellipse cx="45" cy="23" rx="13" ry="28" fill="#F7F7FB" stroke="#222" strokeWidth="4" />
      <ellipse cx="83" cy="23" rx="13" ry="28" fill="#F7F7FB" stroke="#222" strokeWidth="4" />
      <ellipse cx="45" cy="30" rx="6" ry="16" fill="#FFC8D9" />
      <ellipse cx="83" cy="30" rx="6" ry="16" fill="#FFC8D9" />
      <circle cx="64" cy="72" r="34" fill="#F7F7FB" stroke="#222" strokeWidth="4" />
      <circle cx="52" cy="68" r="4" fill="#222" />
      <circle cx="76" cy="68" r="4" fill="#222" />
      <path d="M64 74C60 74 57 77 57 81C57 85 60 88 64 88C68 88 71 85 71 81C71 77 68 74 64 74Z" fill="#FF8FB2" />
      <path d="M53 92C58 97 70 97 75 92" stroke="#222" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export default function Page() {
  return (
    <div className="relative min-h-screen">
      <div className="absolute right-4 top-4 z-50 rounded-full bg-white/90 p-2 shadow-md">
        <BunnyIcon />
      </div>
      <FigmaApp />
    </div>
  );
}
