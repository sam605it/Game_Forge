import { Level } from "../index";

export function generateRacingLevel(game: any): Level {
  return {
    world: { width: 1000, height: 400 },
    entities: [
      {
        id: "car",
        type: "vehicle",
        x: 50,
        y: 200,
        width: 30,
        height: 15,
        vx: 0,
      },
      {
        id: "finish",
        type: "finish",
        x: 900,
        y: 200,
        width: 10,
        height: 100,
      },
    ],
  };
}
