import { useEffect, useRef, useState } from "react";

export function useInput() {
  const [isDown, setIsDown] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);

  function pointerDown(x: number, y: number) {
    setIsDown(true);
    setStartPos({ x, y });
    setCurrentPos({ x, y });
  }

  function pointerMove(x: number, y: number) {
    if (!isDown) return;
    setCurrentPos({ x, y });
  }

  function pointerUp() {
    setIsDown(false);
  }

  // Keyboard support (spacebar)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === "Space") setIsDown(true);
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.code === "Space") setIsDown(false);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return {
    isDown,
    startPos,
    currentPos,
    pointerDown,
    pointerMove,
    pointerUp,
  };
}
