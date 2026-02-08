import type { Entity, GameSpecV1 } from "@/types";
import { SUPPORTED_SHAPES } from "@/lib/runtime/capabilities";

type RuntimeStatus = "idle" | "running" | "won" | "lost" | "paused";

type RuntimeState = {
  score: number;
  timeRemaining: number | null;
  status: RuntimeStatus;
  message: string | null;
};

type EngineCallbacks = {
  onStateChange?: (state: RuntimeState) => void;
};

type InputState = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  action: boolean;
};

const defaultState: RuntimeState = {
  score: 0,
  timeRemaining: null,
  status: "idle",
  message: null,
};

const createFallbackSpec = (): GameSpecV1 => ({
  id: `${Date.now()}`,
  title: "Training Course",
  category: "arcade",
  description: "Reach the goal to win.",
  assets: [],
  world: {
    size: { width: 800, height: 600 },
    physics: { gravity: [0, 0], friction: 0.98, restitution: 0.8, timeStep: 1 / 60 },
    camera: { mode: "static" },
  },
  entities: [
    {
      id: "player",
      kind: "player",
      position: { x: 120, y: 300 },
      velocity: { x: 0, y: 0 },
      size: { width: 32, height: 32 },
      rotation: 0,
      render: { type: "shape", shape: "circle", color: "#38bdf8" },
      collider: { type: "circle", isStatic: false },
      tags: ["player"],
    },
    {
      id: "goal",
      kind: "goal",
      position: { x: 680, y: 300 },
      velocity: { x: 0, y: 0 },
      size: { width: 48, height: 48 },
      rotation: 0,
      render: { type: "shape", shape: "circle", color: "#22c55e" },
      collider: { type: "circle", isStatic: true, isSensor: true },
      tags: ["goal"],
    },
  ],
  rules: [{ type: "win_on_goal", params: { targetTag: "goal", maxSpeed: 999 } }],
  controls: {
    scheme: "keyboard_move",
    mappings: {
      up: ["ArrowUp", "KeyW"],
      down: ["ArrowDown", "KeyS"],
      left: ["ArrowLeft", "KeyA"],
      right: ["ArrowRight", "KeyD"],
      action: ["Space"],
      reset: ["KeyR"],
    },
  },
  ui: {
    hud: [{ type: "message", label: "Reach the goal" }],
    messages: { win: "Goal reached!" },
  },
});

const cloneEntities = (entities: Entity[]) =>
  entities.map((entity) => ({
    ...entity,
    position: { ...entity.position },
    velocity: { ...entity.velocity },
    size: { ...entity.size },
    render: { ...entity.render },
    collider: { ...entity.collider },
    tags: entity.tags ? [...entity.tags] : undefined,
    meta: entity.meta ? { ...entity.meta } : undefined,
  }));

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const intersects = (a: Entity, b: Entity) => {
  if (a.collider.type === "circle" || b.collider.type === "circle") {
    const aRadius = a.collider.type === "circle" ? a.size.width / 2 : Math.min(a.size.width, a.size.height) / 2;
    const bRadius = b.collider.type === "circle" ? b.size.width / 2 : Math.min(b.size.width, b.size.height) / 2;
    const dx = a.position.x - b.position.x;
    const dy = a.position.y - b.position.y;
    return dx * dx + dy * dy <= (aRadius + bRadius) * (aRadius + bRadius);
  }
  return (
    Math.abs(a.position.x - b.position.x) * 2 < a.size.width + b.size.width &&
    Math.abs(a.position.y - b.position.y) * 2 < a.size.height + b.size.height
  );
};

const resolveBoundary = (entity: Entity, worldWidth: number, worldHeight: number, restitution: number) => {
  const halfW = entity.size.width / 2;
  const halfH = entity.size.height / 2;
  if (entity.position.x < halfW) {
    entity.position.x = halfW;
    entity.velocity.x = Math.abs(entity.velocity.x) * restitution;
  }
  if (entity.position.x > worldWidth - halfW) {
    entity.position.x = worldWidth - halfW;
    entity.velocity.x = -Math.abs(entity.velocity.x) * restitution;
  }
  if (entity.position.y < halfH) {
    entity.position.y = halfH;
    entity.velocity.y = Math.abs(entity.velocity.y) * restitution;
  }
  if (entity.position.y > worldHeight - halfH) {
    entity.position.y = worldHeight - halfH;
    entity.velocity.y = -Math.abs(entity.velocity.y) * restitution;
  }
};

export const createEngine = (specInput: GameSpecV1 | null, canvas: HTMLCanvasElement, callbacks: EngineCallbacks = {}) => {
  const spec = specInput ?? createFallbackSpec();
  const isGolfMode =
    spec.controls.scheme === "drag_launch" ||
    (spec.category === "sports" &&
      (spec.title.toLowerCase().includes("golf") || spec.description.toLowerCase().includes("golf")));
  const shootRule = spec.rules.find((rule) => rule.type === "score");
  const shootTag = shootRule?.params?.targetTag ? String(shootRule.params.targetTag) : null;
  const maxLivesRule = spec.rules.find((rule) => rule.type === "lives" || rule.type === "lose_on_lives");
  const maxLives = Number(maxLivesRule?.params?.lives ?? 3);
  const context = canvas.getContext("2d");
  if (!context) {
    return {
      start: () => {},
      pause: () => {},
      reset: () => {},
      dispose: () => {},
      getState: () => defaultState,
    };
  }

  const baseEntities = cloneEntities(spec.entities);
  let entities = cloneEntities(spec.entities);
  let state: RuntimeState = { ...defaultState };
  let frameId: number | null = null;
  let lastTime = 0;
  let strokes = 0;
  let lives = maxLives;
  let status: RuntimeStatus = "idle";
  let actionQueued = false;
  const golfAimMaxDrag = 160;
  const golfAimPowerScale = 0.09;

  const input: InputState = { up: false, down: false, left: false, right: false, action: false };
  const keyMap = spec.controls.mappings;

  const player = () => entities.find((entity) => entity.tags?.includes("player")) ?? entities[0];
  const playerStart = () => {
    const basePlayer = baseEntities.find((entity) => entity.tags?.includes("player")) ?? baseEntities[0];
    return basePlayer ? { x: basePlayer.position.x, y: basePlayer.position.y } : { x: 0, y: 0 };
  };
  const teePosition = playerStart();

  const updateState = (next: Partial<RuntimeState>) => {
    state = { ...state, ...next };
    callbacks.onStateChange?.(state);
  };

  const setStatus = (nextStatus: RuntimeStatus, message?: string | null) => {
    status = nextStatus;
    updateState({ status: nextStatus, message: message ?? state.message });
  };

  const startGame = () => {
    if (status === "running") return;
    if (status === "won" || status === "lost") {
      reset();
    }
    setStatus("running", spec.ui.messages?.start ?? null);
    lastTime = performance.now();
    if (!frameId) {
      frameId = requestAnimationFrame(loop);
    }
  };

  const pause = () => {
    if (status !== "running") return;
    setStatus("paused", "Paused");
  };

  const reset = () => {
    entities = cloneEntities(baseEntities);
    strokes = 0;
    lives = maxLives;
    updateState({ score: 0, timeRemaining: getTimerDuration(), message: null });
    setStatus("idle", spec.ui.messages?.start ?? null);
  };

  const dispose = () => {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = null;
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("pointermove", onPointerMove);
  };

  const getTimerDuration = () => {
    const timerRule = spec.rules.find((rule) => rule.type === "timer" || rule.type === "lose_on_timer");
    if (!timerRule) return null;
    const duration = Number(timerRule.params.duration ?? timerRule.params.time ?? 30);
    return Number.isFinite(duration) ? duration : null;
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const isMovementKey =
      keyMap.up?.includes(event.code) ||
      keyMap.down?.includes(event.code) ||
      keyMap.left?.includes(event.code) ||
      keyMap.right?.includes(event.code) ||
      keyMap.action?.includes(event.code);
    if (isMovementKey && status !== "running") {
      startGame();
    }
    if (keyMap.up?.includes(event.code)) input.up = true;
    if (keyMap.down?.includes(event.code)) input.down = true;
    if (keyMap.left?.includes(event.code)) input.left = true;
    if (keyMap.right?.includes(event.code)) input.right = true;
    if (keyMap.action?.includes(event.code)) {
      input.action = true;
      if (!isGolfMode) actionQueued = true;
    }
    if (keyMap.reset?.includes(event.code) || event.code === "KeyR") {
      reset();
    }
  };

  const onKeyUp = (event: KeyboardEvent) => {
    if (keyMap.up?.includes(event.code)) input.up = false;
    if (keyMap.down?.includes(event.code)) input.down = false;
    if (keyMap.left?.includes(event.code)) input.left = false;
    if (keyMap.right?.includes(event.code)) input.right = false;
    if (keyMap.action?.includes(event.code)) input.action = false;
  };

  let pointerActive = false;
  let pointerTarget: { x: number; y: number } | null = null;
  let golfDragStart: { x: number; y: number } | null = null;
  let golfDragCurrent: { x: number; y: number } | null = null;

  const toWorldPoint = (offsetX: number, offsetY: number) => {
    const canvasRect = canvas.getBoundingClientRect();
    const scaleX = spec.world.size.width / canvasRect.width;
    const scaleY = spec.world.size.height / canvasRect.height;
    return { x: offsetX * scaleX, y: offsetY * scaleY };
  };

  const onPointerDown = (event: PointerEvent) => {
    if (isGolfMode) {
      const pointerStart = toWorldPoint(event.offsetX, event.offsetY);
      const golfBall = player();
      if (!golfBall) return;
      const radius = Math.max(golfBall.size.width, golfBall.size.height) / 2 + 6;
      const dist = Math.hypot(pointerStart.x - golfBall.position.x, pointerStart.y - golfBall.position.y);
      const speed = Math.hypot(golfBall.velocity.x, golfBall.velocity.y);
      if (dist <= radius && speed <= 0.15) {
        if (status !== "running") {
          startGame();
        }
        golfDragStart = { x: golfBall.position.x, y: golfBall.position.y };
        golfDragCurrent = pointerStart;
      }
      return;
    }
    if (status !== "running") {
      startGame();
    }
    pointerActive = true;
    pointerTarget = { x: event.offsetX, y: event.offsetY };
    if (spec.controls.scheme === "mouse_aim_shoot") {
      actionQueued = true;
    }
  };

  const onPointerUp = (event: PointerEvent) => {
    if (isGolfMode && golfDragStart) {
      const end = toWorldPoint(event.offsetX, event.offsetY);
      const golfBall = player();
      if (golfBall) {
        const dx = golfDragStart.x - end.x;
        const dy = golfDragStart.y - end.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 2) {
          const clamped = clamp(distance, 0, golfAimMaxDrag);
          const strength = (clamped / golfAimMaxDrag) * golfAimPowerScale * golfAimMaxDrag;
          const nx = dx / distance;
          const ny = dy / distance;
          golfBall.velocity.x += nx * strength;
          golfBall.velocity.y += ny * strength;
          strokes += 1;
          updateState({ score: strokes });
        }
      }
      golfDragStart = null;
      golfDragCurrent = null;
      return;
    }
    pointerActive = false;
    pointerTarget = null;
  };

  const onPointerMove = (event: PointerEvent) => {
    if (isGolfMode) {
      if (!golfDragStart) return;
      golfDragCurrent = toWorldPoint(event.offsetX, event.offsetY);
      return;
    }
    if (!pointerActive) return;
    pointerTarget = { x: event.offsetX, y: event.offsetY };
  };

  const applyInput = (entity: Entity, delta: number) => {
    if (isGolfMode) return;
    const speed = 220;
    let directionX = 0;
    let directionY = 0;
    if (input.up) directionY -= 1;
    if (input.down) directionY += 1;
    if (input.left) directionX -= 1;
    if (input.right) directionX += 1;

    if (pointerActive && pointerTarget) {
      const target = toWorldPoint(pointerTarget.x, pointerTarget.y);
      const targetX = target.x;
      const targetY = target.y;
      directionX = clamp((targetX - entity.position.x) / 100, -1, 1);
      directionY = clamp((targetY - entity.position.y) / 100, -1, 1);
    }

    entity.velocity.x += directionX * speed * delta;
    entity.velocity.y += directionY * speed * delta;
  };

  const applyPhysics = (delta: number) => {
    const [gravityX, gravityY] = spec.world.physics.gravity;
    const friction = spec.world.physics.friction;
    const restitution = spec.world.physics.restitution;
    const worldWidth = spec.world.size.width;
    const worldHeight = spec.world.size.height;

    for (const entity of entities) {
      if (entity.collider.isStatic) continue;
      if (entity.tags?.includes("player")) {
        applyInput(entity, delta);
      }
      entity.velocity.x += gravityX * delta;
      entity.velocity.y += gravityY * delta;
      entity.velocity.x *= friction;
      entity.velocity.y *= friction;
      entity.position.x += entity.velocity.x * delta;
      entity.position.y += entity.velocity.y * delta;
      resolveBoundary(entity, worldWidth, worldHeight, restitution);
    }
  };

  const handleCollisions = () => {
    const playerEntity = player();
    if (!playerEntity) return;

    for (const entity of entities) {
      if (entity.id === playerEntity.id) continue;
      if (!intersects(playerEntity, entity)) continue;

      if (entity.collider.isSensor) {
        if (isGolfMode && entity.tags?.includes("hazard")) {
          const start = playerStart();
          playerEntity.position.x = start.x;
          playerEntity.position.y = start.y;
          playerEntity.velocity.x = 0;
          playerEntity.velocity.y = 0;
          updateState({ message: "Hazard! Ball reset." });
          continue;
        }
        evaluateRules(entity);
        continue;
      }

      if (!entity.collider.isStatic) {
        const tempX = playerEntity.velocity.x;
        const tempY = playerEntity.velocity.y;
        playerEntity.velocity.x = entity.velocity.x;
        playerEntity.velocity.y = entity.velocity.y;
        entity.velocity.x = tempX;
        entity.velocity.y = tempY;
      } else {
        playerEntity.velocity.x *= -spec.world.physics.restitution;
        playerEntity.velocity.y *= -spec.world.physics.restitution;
      }
      evaluateRules(entity);
    }
  };

  const evaluateRules = (collidedEntity: Entity | null) => {
    if (status !== "running") return;

    for (const rule of spec.rules) {
      if (rule.type === "timer" || rule.type === "lose_on_timer") {
        if (state.timeRemaining !== null && state.timeRemaining <= 0) {
          setStatus("lost", spec.ui.messages?.lose ?? "Time's up!");
        }
      }
      if (!collidedEntity) continue;
      if (rule.type === "score") {
        const targetTag = rule.params.targetTag ?? "pickup";
        if (collidedEntity.tags?.includes(targetTag) && collidedEntity.collider.isSensor) {
          state.score += Number(rule.params.amount ?? 1);
          updateState({ score: state.score, message: `+${rule.params.amount ?? 1}` });
          entities = entities.filter((entity) => entity.id !== collidedEntity.id);
        }
      }
      if (rule.type === "lose_on_lives") {
        if (collidedEntity.tags?.includes("hazard") || collidedEntity.tags?.includes("enemy")) {
          lives = Math.max(0, lives - 1);
          updateState({ message: `Hit! ${lives} lives left.` });
          if (lives <= 0) {
            setStatus("lost", spec.ui.messages?.lose ?? "Out of lives!");
          }
        }
      }
      if (rule.type === "win_on_goal") {
        const targetTag = rule.params.targetTag ?? "goal";
        if (collidedEntity.tags?.includes(targetTag)) {
          const playerEntity = player();
          const maxSpeed = Number(rule.params.maxSpeed ?? 1.2);
          const speed = playerEntity ? Math.hypot(playerEntity.velocity.x, playerEntity.velocity.y) : 0;
          if (speed <= maxSpeed && playerEntity) {
            if (isGolfMode) {
              const cupRadius = Math.max(collidedEntity.size.width, collidedEntity.size.height) / 2;
              const distance = Math.hypot(
                playerEntity.position.x - collidedEntity.position.x,
                playerEntity.position.y - collidedEntity.position.y,
              );
              if (distance <= cupRadius) {
                playerEntity.position.x = collidedEntity.position.x;
                playerEntity.position.y = collidedEntity.position.y;
                playerEntity.velocity.x = 0;
                playerEntity.velocity.y = 0;
                setStatus("won", spec.ui.messages?.win ?? "HOLE IN!");
              }
            } else {
              setStatus("won", spec.ui.messages?.win ?? "Goal reached!");
            }
          }
        }
      }
      if (rule.type === "win_on_score") {
        const targetScore = Number(rule.params.targetScore ?? 1);
        if (state.score >= targetScore) {
          setStatus("won", spec.ui.messages?.win ?? "Score reached!");
        }
      }
    }
  };

  const updateTimer = (delta: number) => {
    if (state.timeRemaining === null) return;
    const nextTime = Math.max(0, state.timeRemaining - delta);
    updateState({ timeRemaining: nextTime });
    if (nextTime <= 0) {
      setStatus("lost", spec.ui.messages?.lose ?? "Time's up!");
    }
  };

  const drawEntity = (entity: Entity) => {
    const halfW = entity.size.width / 2;
    const halfH = entity.size.height / 2;
    let shapeDrawn = false;
    const isCup = isGolfMode && (entity.tags?.includes("goal") || entity.tags?.includes("cup"));
    const isBall = isGolfMode && entity.tags?.includes("ball");
    const color = entity.render.color ?? "#94a3b8";
    if (entity.render.shape && !SUPPORTED_SHAPES.includes(entity.render.shape)) {
      return;
    }
    if (isCup) {
      const radius = Math.max(halfW, halfH);
      context.fillStyle = "#e2e8f0";
      context.beginPath();
      context.arc(entity.position.x, entity.position.y, radius, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = color;
      context.beginPath();
      context.arc(entity.position.x, entity.position.y, radius * 0.55, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = "#0f172a";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(entity.position.x + radius * 0.2, entity.position.y - radius * 1.2);
      context.lineTo(entity.position.x + radius * 0.2, entity.position.y - radius * 2);
      context.stroke();
      context.fillStyle = "#ef4444";
      context.beginPath();
      context.moveTo(entity.position.x + radius * 0.2, entity.position.y - radius * 2);
      context.lineTo(entity.position.x + radius * 1.2, entity.position.y - radius * 1.6);
      context.lineTo(entity.position.x + radius * 0.2, entity.position.y - radius * 1.2);
      context.closePath();
      context.fill();
      shapeDrawn = true;
    }
    if (!shapeDrawn) {
      context.fillStyle = color;
      if (entity.render.shape === "line") {
        context.strokeStyle = color;
        context.lineWidth = Math.max(2, entity.size.height);
        context.beginPath();
        context.moveTo(entity.position.x - halfW, entity.position.y);
        context.lineTo(entity.position.x + halfW, entity.position.y);
        context.stroke();
        shapeDrawn = true;
      } else if (entity.render.shape === "circle" || entity.collider.type === "circle") {
        const radius = Math.max(halfW, halfH);
        context.beginPath();
        context.arc(entity.position.x, entity.position.y, radius, 0, Math.PI * 2);
        context.fill();
        if (isBall) {
          context.fillStyle = "#cbd5f5";
          context.beginPath();
          context.arc(entity.position.x - radius * 0.25, entity.position.y - radius * 0.25, radius * 0.25, 0, Math.PI * 2);
          context.fill();
        }
        shapeDrawn = true;
      } else {
        context.fillRect(entity.position.x - halfW, entity.position.y - halfH, entity.size.width, entity.size.height);
        shapeDrawn = true;
      }
    }
    const overlayEmoji = entity.meta?.iconEmoji ?? entity.render.emoji;
    if (overlayEmoji) {
      try {
        context.font = `${Math.max(entity.size.width, entity.size.height)}px sans-serif`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(overlayEmoji, entity.position.x, entity.position.y + 4);
      } catch {
        // Ignore emoji rendering errors to preserve shape rendering.
      }
    }
  };

  const render = () => {
    const { width, height } = spec.world.size;
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvas.clientWidth || width;
    const displayHeight = canvas.clientHeight || height;
    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }
    const scaleX = displayWidth / width;
    const scaleY = displayHeight / height;
    context.save();
    context.scale(dpr * scaleX, dpr * scaleY);
    context.clearRect(0, 0, width, height);
    context.fillStyle = isGolfMode ? "#14532d" : "#0f172a";
    context.fillRect(0, 0, width, height);
    if (isGolfMode) {
      context.fillStyle = "#1e293b";
      context.beginPath();
      context.arc(teePosition.x, teePosition.y, 6, 0, Math.PI * 2);
      context.fill();
    }
    for (const entity of entities) {
      drawEntity(entity);
    }
    if (isGolfMode && golfDragStart && golfDragCurrent) {
      context.strokeStyle = "#facc15";
      context.lineWidth = 2;
      const dx = golfDragStart.x - golfDragCurrent.x;
      const dy = golfDragStart.y - golfDragCurrent.y;
      const distance = Math.hypot(dx, dy);
      const clamped = clamp(distance, 0, golfAimMaxDrag);
      const aimScale = distance === 0 ? 0 : clamped / distance;
      const aimEndX = golfDragStart.x + dx * aimScale;
      const aimEndY = golfDragStart.y + dy * aimScale;
      context.beginPath();
      context.moveTo(golfDragStart.x, golfDragStart.y);
      context.lineTo(aimEndX, aimEndY);
      context.stroke();
      const powerPercent = clamped / golfAimMaxDrag;
      context.fillStyle = "rgba(15, 23, 42, 0.7)";
      context.fillRect(16, 16, 120, 14);
      context.fillStyle = "#facc15";
      context.fillRect(18, 18, 116 * powerPercent, 10);
      context.strokeStyle = "#e2e8f0";
      context.strokeRect(16, 16, 120, 14);
      context.fillStyle = "#f8fafc";
      context.font = "12px sans-serif";
      context.fillText("Power", 16, 42);
    }
    context.restore();
  };

  const loop = (time: number) => {
    if (status !== "running") {
      render();
      frameId = requestAnimationFrame(loop);
      return;
    }
    const delta = Math.min(0.033, (time - lastTime) / 1000);
    lastTime = time;
    if (actionQueued && shootTag) {
      actionQueued = false;
      const playerEntity = player();
      if (playerEntity) {
        const range = 140;
        let closest: { entity: Entity; dist: number } | null = null;
        for (const entity of entities) {
          if (entity.id === playerEntity.id) continue;
          if (!entity.tags?.includes(shootTag)) continue;
          const dx = entity.position.x - playerEntity.position.x;
          const dy = entity.position.y - playerEntity.position.y;
          const dist = Math.hypot(dx, dy);
          if (dist <= range && (!closest || dist < closest.dist)) {
            closest = { entity, dist };
          }
        }
        if (closest) {
          entities = entities.filter((item) => item.id !== closest.entity.id);
          state.score += Number(spec.rules.find((rule) => rule.type === "score")?.params.amount ?? 1);
          updateState({ score: state.score });
          const winRule = spec.rules.find((rule) => rule.type === "win_on_score");
          if (winRule) {
            const targetScore = Number(winRule.params.targetScore ?? 1);
            if (state.score >= targetScore) {
              setStatus("won", spec.ui.messages?.win ?? "Score reached!");
            }
          }
        }
      }
    }
    applyPhysics(delta);
    handleCollisions();
    updateTimer(delta);
    render();
    frameId = requestAnimationFrame(loop);
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointermove", onPointerMove);

  updateState({ timeRemaining: getTimerDuration() });
  render();
  frameId = requestAnimationFrame(loop);

  return {
    start: startGame,
    pause,
    reset,
    dispose,
    getState: () => state,
    getSpec: () => spec,
  };
};

export { createFallbackSpec };
