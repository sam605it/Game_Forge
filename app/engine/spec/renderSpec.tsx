import type { GameSpecV1 } from "@/app/gamespec/types";
import { Grid2DRunner } from "./runners/Grid2DRunner";
import { Physics2DRunner } from "./runners/Physics2DRunner";
import { Platformer2DRunner } from "./runners/Platformer2DRunner";
import { Rhythm2DRunner } from "./runners/Rhythm2DRunner";
import { Topdown2DRunner } from "./runners/Topdown2DRunner";

export function renderSpec(spec: GameSpecV1) {
  switch (spec.metadata.template) {
    case "physics_2d":
      return <Physics2DRunner spec={spec} />;
    case "platformer_2d":
      return <Platformer2DRunner spec={spec} />;
    case "grid_2d":
      return <Grid2DRunner spec={spec} />;
    case "rhythm_2d":
      return <Rhythm2DRunner spec={spec} />;
    case "topdown_2d":
    default:
      return <Topdown2DRunner spec={spec} />;
  }
}
