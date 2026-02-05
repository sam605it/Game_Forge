import { GameBlueprint } from "../blueprint";

export function forgeGame(ai: any): GameBlueprint {
  return {
    genre: ai.genre,
    themeId: ai.themeId,

    world: {
      background: "#0A7A2A",
    },

    player: {
      icon: ai.playerIcon ?? "⚪",
      color: "#ffffff",
      shape: "circle",
    },

    entities: [],
  };
}
