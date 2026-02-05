import { Level } from "../index";

export function generateSportsLevel(game: any): Level {
  const width = 800;
  const height = 400;

  return {
    world: { width, height },
    entities: [
      {
        id: "player",
        type: "ball",
        x: 80,
        y: height / 2,
        radius: 8,
        vx: 0,
        vy: 0,
      },
      {
        id: "goal",
        type: "goal",
        x: width - 80,
        y: height / 2,
        radius: 14,
      },
    ],
  };
}
