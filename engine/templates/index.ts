import type { TemplateDefinition } from "@/engine/types";
import { arenaBoss } from "./arena_boss";
import { basketballShoot } from "./basketball_shoot";
import { breakout } from "./breakout";
import { captureFlag } from "./capture_flag";
import { cityBuilder } from "./city_builder";
import { dodgeArena } from "./dodge_arena";
import { farmingSim } from "./farming_sim";
import { fishingHunt } from "./fishing_hunt";
import { gridPuzzle } from "./grid_puzzle";
import { mazeEscape } from "./maze_escape";
import { minigolf } from "./minigolf";
import { mining } from "./mining";
import { pinball } from "./pinball";
import { platformer } from "./platformer";
import { racingTimeTrial } from "./racing_time_trial";
import { rhythmTap } from "./rhythm_tap";
import { runner } from "./runner";
import { soccer } from "./soccer";
import { spaceLander } from "./space_lander";
import { stealthEscape } from "./stealth_escape";
import { survival } from "./survival";
import { topdownShooter } from "./topdown_shooter";
import { towerDefense } from "./tower_defense";
import { treasureCollect } from "./treasure_collect";
import { triviaQuiz } from "./trivia_quiz";

export const TEMPLATES: TemplateDefinition[] = [
  minigolf,
  topdownShooter,
  dodgeArena,
  runner,
  platformer,
  mazeEscape,
  treasureCollect,
  survival,
  breakout,
  spaceLander,
  gridPuzzle,
  towerDefense,
  stealthEscape,
  captureFlag,
  arenaBoss,
  racingTimeTrial,
  pinball,
  farmingSim,
  fishingHunt,
  soccer,
  basketballShoot,
  mining,
  rhythmTap,
  triviaQuiz,
  cityBuilder,
];

export const TEMPLATE_MAP = new Map(TEMPLATES.map((template) => [template.id, template]));
