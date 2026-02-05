type ForgedGame = {
  genre: string;
  themeId: string;
  world: {
    background: string;
  };
  player: {
    icon: string;
    color: string;
    shape: string;
  };
  entities: unknown[];
};

export function forgeGame(ai: any): ForgedGame {
  return {
    genre: ai?.genre ?? "sports",
    themeId: ai?.themeId ?? "minigolf",
    world: {
      background: "#0A7A2A",
    },
    player: {
      icon: ai?.playerIcon ?? "⚪",
      color: "#ffffff",
      shape: "circle",
    },
    entities: [],
  };
}
