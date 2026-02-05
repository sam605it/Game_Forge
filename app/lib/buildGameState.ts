export function buildGameState(aiGame: any) {
  const icon = aiGame?.playerIcon ?? "golf_ball";

  return {
    world: {
      width: 800,
      height: 400,
    },
    entities: [
      {
        id: "player",
        type: "ball",
        x: 120,
        y: 200,
        radius: 14,
        vx: 0,
        vy: 0,
        icon,
      },
      {
        id: "hole",
        type: "hole",
        x: 680,
        y: 200,
        radius: 14,
      },
    ],
  };
}
