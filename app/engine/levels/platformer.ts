import { Level } from "../index";

export function generatePlatformerLevel(game: any): Level {
  return {
    world: { width: 800, height: 450 },
    entities: [
      {
        id: "player",
        type: "player",
        x: 50,
        y: 300,
        width: 20,
        height: 40,
        vx: 0,
        vy: 0,
      },
      {
        id: "ground",
        type: "platform",
        x: 0,
        y: 380,
        width: 800,
        height: 20,
      },
    ],
  };
}
