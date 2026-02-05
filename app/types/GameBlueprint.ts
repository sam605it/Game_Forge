
export type GameBlueprint = {
  meta: {
    title: string;
    genre: "sports" | "platformer" | "puzzle" | "idle" | "arcade";
  };

  world: {
    width: number;
    height: number;
    gravity: number;
    friction: number;
  };

  player: {
    entityId: string;
    controls: ("mouse" | "keyboard" | "touch")[];
    abilities: string[];
  };

  objects: Array<{
    id: string;
    kind: "player" | "ball" | "goal" | "obstacle" | "enemy" | "collectible";
    x: number;
    y: number;
    radius?: number;
    behavior: "static" | "movable" | "bouncy";
  }>;

  rules: {
    win: string;
    lose?: string;
  };

  visuals: {
    theme: string;
    background: string;
  };
};

