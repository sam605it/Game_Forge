import type { GameSpec } from "@/lib/gamespec/schema";
import { getIconDataUrl } from "@/lib/icons/iconFactory";

export type MiniGolfRuntime = {
  dispose: () => void;
};

export type MiniGolfOptions = {
  showHud?: boolean;
  backgroundColor?: string;
  onStatsChange?: (stats: { strokes: number; holeIndex: number; holeCount: number }) => void;
};

type BallState = {
  pos: [number, number];
  vel: [number, number];
  strokes: number;
  holeIndex: number;
  sunk: boolean;
};

type HoleProps = {
  holeIndex: number;
  tee?: [number, number];
};

const imageCache = new Map<string, HTMLImageElement>();

function loadIcon(iconId: string) {
  if (imageCache.has(iconId)) return imageCache.get(iconId)!;
  const img = new Image();
  img.src = getIconDataUrl(iconId);
  imageCache.set(iconId, img);
  return img;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getHoleProps(value: unknown): HoleProps | null {
  if (!isRecord(value)) return null;
  if (typeof value.holeIndex !== "number") return null;
  if (value.tee === undefined) return { holeIndex: value.holeIndex };
  if (
    Array.isArray(value.tee) &&
    value.tee.length === 2 &&
    typeof value.tee[0] === "number" &&
    typeof value.tee[1] === "number"
  ) {
    return { holeIndex: value.holeIndex, tee: [value.tee[0], value.tee[1]] };
  }
  return { holeIndex: value.holeIndex };
}

export function runMiniGolf(
  spec: GameSpec,
  canvas: HTMLCanvasElement,
  options: MiniGolfOptions = {},
): MiniGolfRuntime {
  const context = canvas.getContext("2d");
  if (!context) {
    return { dispose: () => {} };
  }

  canvas.width = spec.world.width;
  canvas.height = spec.world.height;

  const ballEntity = spec.entities.find((entity) => entity.type === "golf_ball");
  const holeEntities = spec.entities.filter((entity) => entity.type === "hole");
  const wallEntities = spec.entities.filter((entity) => entity.type === "wall");
  const decorationEntities = spec.entities.filter(
    (entity) => !["golf_ball", "hole", "wall"].includes(entity.type),
  );

  const ballState: BallState = {
    pos: ballEntity?.pos ?? [100, 100],
    vel: [0, 0],
    strokes: 0,
    holeIndex: 0,
    sunk: false,
  };

  let isDragging = false;
  let dragStart: [number, number] | null = null;
  let dragEnd: [number, number] | null = null;
  let rafId = 0;
  let lastStrokeCount = -1;
  let lastHoleIndex = -1;

  function applyShot() {
    if (!dragStart || !dragEnd) return;
    const dx = dragStart[0] - dragEnd[0];
    const dy = dragStart[1] - dragEnd[1];
    const power = clamp(Math.hypot(dx, dy) / 6, 0, 12);
    if (power < 0.5) return;
    ballState.vel = [dx * 0.08, dy * 0.08];
    ballState.strokes += 1;
  }

  function handlePointerDown(event: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    dragStart = [event.clientX - rect.left, event.clientY - rect.top];
    dragEnd = dragStart;
    isDragging = true;
  }

  function handlePointerMove(event: PointerEvent) {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    dragEnd = [event.clientX - rect.left, event.clientY - rect.top];
  }

  function handlePointerUp() {
    isDragging = false;
    applyShot();
    dragStart = null;
    dragEnd = null;
  }

  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointerleave", handlePointerUp);

  function updateBall() {
    const [vx, vy] = ballState.vel;
    const friction = spec.world.physics.friction;
    const nextVel: [number, number] = [vx * friction, vy * friction];
    let [x, y] = ballState.pos;
    x += nextVel[0];
    y += nextVel[1];

    wallEntities.forEach((wall) => {
      const [wx, wy] = wall.pos;
      const [ww, wh] = wall.size;
      const inside = x > wx && x < wx + ww && y > wy && y < wy + wh;
      if (!inside) return;
      const distLeft = Math.abs(x - wx);
      const distRight = Math.abs(x - (wx + ww));
      const distTop = Math.abs(y - wy);
      const distBottom = Math.abs(y - (wy + wh));
      const minDist = Math.min(distLeft, distRight, distTop, distBottom);

      if (minDist === distLeft) {
        x = wx - 2;
        nextVel[0] *= -spec.world.physics.restitution;
      } else if (minDist === distRight) {
        x = wx + ww + 2;
        nextVel[0] *= -spec.world.physics.restitution;
      } else if (minDist === distTop) {
        y = wy - 2;
        nextVel[1] *= -spec.world.physics.restitution;
      } else {
        y = wy + wh + 2;
        nextVel[1] *= -spec.world.physics.restitution;
      }
    });

    ballState.pos = [x, y];
    ballState.vel = nextVel;

    const speed = Math.hypot(nextVel[0], nextVel[1]);
    if (speed < 0.05) {
      ballState.vel = [0, 0];
    }

    const currentHole = holeEntities.find((hole) => {
      const props = getHoleProps(hole.props);
      return props?.holeIndex === ballState.holeIndex;
    });
    if (currentHole && speed < 0.4) {
      const dx = ballState.pos[0] - currentHole.pos[0];
      const dy = ballState.pos[1] - currentHole.pos[1];
      if (Math.hypot(dx, dy) < 18) {
        ballState.sunk = true;
      }
    }

    if (ballState.sunk) {
      const nextIndex = ballState.holeIndex + 1;
      if (nextIndex < holeEntities.length) {
        const nextHole = holeEntities.find((hole) => {
          const props = getHoleProps(hole.props);
          return props?.holeIndex === nextIndex;
        });
        const nextProps = nextHole ? getHoleProps(nextHole.props) : null;
        ballState.holeIndex = nextIndex;
        ballState.pos = nextProps?.tee ?? [140, 140 + nextIndex * 40];
        ballState.vel = [0, 0];
        ballState.sunk = false;
      }
    }

    if (
      options.onStatsChange &&
      (ballState.strokes !== lastStrokeCount || ballState.holeIndex !== lastHoleIndex)
    ) {
      lastStrokeCount = ballState.strokes;
      lastHoleIndex = ballState.holeIndex;
      options.onStatsChange({
        strokes: ballState.strokes,
        holeIndex: ballState.holeIndex,
        holeCount: holeEntities.length,
      });
    }
  }

  function drawEntity(entity: GameSpec["entities"][number]) {
    const img = loadIcon(entity.sprite.iconId);
    const [x, y] = entity.pos;
    const [w, h] = entity.size;
    context.drawImage(img, x - w / 2, y - h / 2, w, h);
  }

  function drawHud() {
    context.fillStyle = "#0B132B";
    context.fillRect(16, 16, 240, 60);
    context.fillStyle = "#FFFFFF";
    context.font = "14px sans-serif";
    context.fillText(`Strokes: ${ballState.strokes}`, 28, 40);
    context.fillText(`Hole: ${ballState.holeIndex + 1}/${holeEntities.length}`, 28, 60);
  }

  function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = options.backgroundColor ?? "#F1F5F9";
    context.fillRect(0, 0, canvas.width, canvas.height);

    decorationEntities.forEach(drawEntity);
    wallEntities.forEach(drawEntity);
    holeEntities.forEach(drawEntity);

    if (ballEntity) {
      drawEntity({ ...ballEntity, pos: ballState.pos });
    }

    if (isDragging && dragStart && dragEnd) {
      context.strokeStyle = "#FF4D6D";
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(dragStart[0], dragStart[1]);
      context.lineTo(dragEnd[0], dragEnd[1]);
      context.stroke();
    }

    if (options.showHud !== false) {
      drawHud();
    }
  }

  function loop() {
    updateBall();
    render();
    rafId = requestAnimationFrame(loop);
  }

  loop();

  return {
    dispose: () => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointerleave", handlePointerUp);
    },
  };
}
