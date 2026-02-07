import type { Entity, GameSpecV1 } from "@/types";

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
  title: "Spark Dodge",
  category: "arcade",
  description: "Dodge the sparks and reach the safe zone.",
  assets: ["⚡", "🛡️"],
  world: {
    size: { width: 800, height: 600 },
    physics: { gravity: [0, 0], friction: 0.98, restitution: 0.8, timeStep: 1 / 60 },
    camera: { mode: "static" },
  },
  entities: [
    {
      id: "player",
      kind: "hero",
      position: { x: 120, y: 300 },
      velocity: { x: 0, y: 0 },
      size: { width: 32, height: 32 },
      rotation: 0,
      render: { type: "emoji", emoji: "🛡️" },
      collider: { type: "rect", isStatic: false },
      tags: ["player"],
    },
    {
      id: "goal",
      kind: "goal",
      position: { x: 680, y: 300 },
      velocity: { x: 0, y: 0 },
      size: { width: 48, height: 48 },
      rotation: 0,
      render: { type: "shape", shape: "rect", color: "#22c55e" },
      collider: { type: "rect", isStatic: true, isSensor: true },
      tags: ["goal"],
    },
    {
      id: "hazard-1",
      kind: "hazard",
      position: { x: 400, y: 200 },
      velocity: { x: 120, y: 90 },
      size: { width: 28, height: 28 },
      rotation: 0,
      render: { type: "emoji", emoji: "⚡" },
      collider: { type: "circle", isStatic: false, isSensor: true },
      tags: ["hazard"],
    },
  ],
  rules: [
    { type: "goal", params: { targetTag: "goal" } },
    { type: "avoid", params: { targetTag: "hazard" } },
  ],
  controls: {
    scheme: "hybrid",
    mappings: { up: ["ArrowUp", "KeyW"], down: ["ArrowDown", "KeyS"], left: ["ArrowLeft", "KeyA"], right: ["ArrowRight", "KeyD"], action: ["Space"] },
  },
  ui: {
    hud: [{ type: "message", label: "Escape the sparks" }],
    messages: { win: "Safe zone reached!", lose: "Zapped! Try again." },
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
  let collected = 0;
  let status: RuntimeStatus = "idle";

  const input: InputState = { up: false, down: false, left: false, right: false, action: false };
  const keyMap = spec.controls.mappings;

  const player = () => entities.find((entity) => entity.tags?.includes("player")) ?? entities[0];

  const updateState = (next: Partial<RuntimeState>) => {
    state = { ...state, ...next };
    callbacks.onStateChange?.(state);
  };

  const setStatus = (nextStatus: RuntimeStatus, message?: string | null) => {
    status = nextStatus;
    updateState({ status: nextStatus, message: message ?? state.message });
  };

  const start = () => {
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
    collected = 0;
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
    const timerRule = spec.rules.find((rule) => rule.type === "timer");
    if (!timerRule) return null;
    const duration = Number(timerRule.params.duration ?? timerRule.params.time ?? 30);
    return Number.isFinite(duration) ? duration : null;
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (keyMap.up?.includes(event.code)) input.up = true;
    if (keyMap.down?.includes(event.code)) input.down = true;
    if (keyMap.left?.includes(event.code)) input.left = true;
    if (keyMap.right?.includes(event.code)) input.right = true;
    if (keyMap.action?.includes(event.code)) input.action = true;
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

  const onPointerDown = (event: PointerEvent) => {
    pointerActive = true;
    pointerTarget = { x: event.offsetX, y: event.offsetY };
  };

  const onPointerUp = () => {
    pointerActive = false;
    pointerTarget = null;
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!pointerActive) return;
    pointerTarget = { x: event.offsetX, y: event.offsetY };
  };

  const applyInput = (entity: Entity, delta: number) => {
    const speed = 220;
    let directionX = 0;
    let directionY = 0;
    if (input.up) directionY -= 1;
    if (input.down) directionY += 1;
    if (input.left) directionX -= 1;
    if (input.right) directionX += 1;

    if (pointerActive && pointerTarget) {
      const canvasRect = canvas.getBoundingClientRect();
      const scaleX = spec.world.size.width / canvasRect.width;
      const scaleY = spec.world.size.height / canvasRect.height;
      const targetX = pointerTarget.x * scaleX;
      const targetY = pointerTarget.y * scaleY;
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

      if (entity.collider.isSensor || entity.tags?.includes("collectible")) {
        if (entity.tags?.includes("collectible")) {
          collected += 1;
          state.score += Number(spec.rules.find((rule) => rule.type === "score")?.params.amount ?? 1);
          entities = entities.filter((item) => item.id !== entity.id);
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
      if (rule.type === "timer") {
        if (state.timeRemaining !== null && state.timeRemaining <= 0) {
          setStatus("lost", spec.ui.messages?.lose ?? "Time's up!");
        }
      }
      if (!collidedEntity) continue;
      if (rule.type === "goal") {
        const targetTag = rule.params.targetTag ?? "goal";
        if (collidedEntity.tags?.includes(targetTag)) {
          setStatus("won", spec.ui.messages?.win ?? "Goal reached!");
        }
      }
      if (rule.type === "avoid") {
        const targetTag = rule.params.targetTag ?? "hazard";
        if (collidedEntity.tags?.includes(targetTag)) {
          setStatus("lost", spec.ui.messages?.lose ?? "You were caught!");
        }
      }
      if (rule.type === "collect") {
        const targetTag = rule.params.targetTag ?? "collectible";
        const targetCount = Number(rule.params.count ?? 3);
        if (collidedEntity.tags?.includes(targetTag)) {
          if (collected >= targetCount) {
            setStatus("won", spec.ui.messages?.win ?? "Collection complete!");
          }
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
    if (entity.render.type === "emoji" && entity.render.emoji) {
      context.font = `${Math.max(entity.size.width, entity.size.height)}px sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(entity.render.emoji, entity.position.x, entity.position.y + 4);
      return;
    }
    const color = entity.render.color ?? "#94a3b8";
    context.fillStyle = color;
    if (entity.render.shape === "circle" || entity.collider.type === "circle") {
      const radius = Math.max(halfW, halfH);
      context.beginPath();
      context.arc(entity.position.x, entity.position.y, radius, 0, Math.PI * 2);
      context.fill();
      return;
    }
    context.fillRect(entity.position.x - halfW, entity.position.y - halfH, entity.size.width, entity.size.height);
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
    context.fillStyle = "#0f172a";
    context.fillRect(0, 0, width, height);
    for (const entity of entities) {
      drawEntity(entity);
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
    start,
    pause,
    reset,
    dispose,
    getState: () => state,
    getSpec: () => spec,
  };
};

export { createFallbackSpec };
