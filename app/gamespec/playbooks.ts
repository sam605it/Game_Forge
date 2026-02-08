import type { Category, GameSpecV1, Template } from "./types";

export type CategoryPlaybook = {
  defaultTemplate: Template;
  requiredMechanics: string[];
  preferredCamera: GameSpecV1["world"]["camera"]["mode"];
  physics: GameSpecV1["world"]["physics"];
  requiredEntityKinds: string[];
  uiInstructions: string[];
  recognizabilityRules: string[];
};

export const CATEGORY_PLAYBOOKS: Record<Category, CategoryPlaybook> = {
  sports: {
    defaultTemplate: "physics_2d",
    requiredMechanics: ["drag_shot", "collisions", "goal_trigger", "decor_scatter"],
    preferredCamera: "topdown",
    physics: { gravity: [0, 0], friction: 0.03, restitution: 0.45, timeStep: 1 / 60 },
    requiredEntityKinds: ["ball", "goal", "wall", "obstacle"],
    uiInstructions: ["Show strokes/score", "Show objective text", "Show win state"],
    recognizabilityRules: ["Playable course", "Target/hole", "Obstacles with collision"],
  },
  puzzle: {
    defaultTemplate: "grid_2d",
    requiredMechanics: ["grid_move", "block_push", "goal_tiles"],
    preferredCamera: "static",
    physics: { gravity: [0, 0], friction: 0.02, restitution: 0.1, timeStep: 1 / 60 },
    requiredEntityKinds: ["player", "crate", "goal"],
    uiInstructions: ["Show moves", "Show puzzle objective"],
    recognizabilityRules: ["Constrained grid", "Clear solve condition"],
  },
  arcade: {
    defaultTemplate: "topdown_2d",
    requiredMechanics: ["collect", "avoid", "timer"],
    preferredCamera: "topdown",
    physics: { gravity: [0, 0], friction: 0.04, restitution: 0.2, timeStep: 1 / 60 },
    requiredEntityKinds: ["player", "coin", "hazard"],
    uiInstructions: ["Show timer", "Show score"],
    recognizabilityRules: ["Fast score chase", "Collect vs avoid loop"],
  },
  action: {
    defaultTemplate: "topdown_2d",
    requiredMechanics: ["dodge", "survive_timer", "hazard_spawn"],
    preferredCamera: "topdown",
    physics: { gravity: [0, 0], friction: 0.02, restitution: 0.1, timeStep: 1 / 60 },
    requiredEntityKinds: ["player", "hazard"],
    uiInstructions: ["Show health/time", "Show survive objective"],
    recognizabilityRules: ["Escalating hazard pressure", "Survival loop"],
  },
  racing: {
    defaultTemplate: "topdown_2d",
    requiredMechanics: ["steer", "lap_or_finish", "obstacles"],
    preferredCamera: "topdown",
    physics: { gravity: [0, 0], friction: 0.05, restitution: 0.2, timeStep: 1 / 60 },
    requiredEntityKinds: ["car", "finish", "track_wall"],
    uiInstructions: ["Show timer", "Show lap/finish objective"],
    recognizabilityRules: ["Track boundaries", "Steering controls", "Finish trigger"],
  },
  platformer: {
    defaultTemplate: "platformer_2d",
    requiredMechanics: ["jump", "run", "goal_reach"],
    preferredCamera: "follow",
    physics: { gravity: [0, 340], friction: 0.03, restitution: 0.05, timeStep: 1 / 60 },
    requiredEntityKinds: ["player", "platform", "goal"],
    uiInstructions: ["Show controls hint", "Show objective"],
    recognizabilityRules: ["Platforms/gaps", "Jump timing", "Exit goal"],
  },
  shooter: {
    defaultTemplate: "topdown_2d",
    requiredMechanics: ["aim", "projectiles", "enemy_spawn"],
    preferredCamera: "topdown",
    physics: { gravity: [0, 0], friction: 0.02, restitution: 0.1, timeStep: 1 / 60 },
    requiredEntityKinds: ["player", "enemy", "projectile"],
    uiInstructions: ["Show health", "Show score"],
    recognizabilityRules: ["Shoot enemies", "Threat pressure", "Clear fail/win loop"],
  },
  strategy: {
    defaultTemplate: "topdown_2d",
    requiredMechanics: ["path_enemies", "tower_place", "auto_attack"],
    preferredCamera: "topdown",
    physics: { gravity: [0, 0], friction: 0.01, restitution: 0.05, timeStep: 1 / 60 },
    requiredEntityKinds: ["path", "tower", "enemy"],
    uiInstructions: ["Show gold/waves", "Show placement hint"],
    recognizabilityRules: ["Path + waves", "Placeable defenses", "Auto combat"],
  },
  simulation: {
    defaultTemplate: "physics_2d",
    requiredMechanics: ["spawn", "physics_interact", "sandbox"],
    preferredCamera: "static",
    physics: { gravity: [0, 220], friction: 0.03, restitution: 0.4, timeStep: 1 / 60 },
    requiredEntityKinds: ["player", "object"],
    uiInstructions: ["Show sandbox hint", "Show optional goal"],
    recognizabilityRules: ["Spawn + interact loop", "Observable physics"],
  },
  rhythm_music: {
    defaultTemplate: "rhythm_2d",
    requiredMechanics: ["beat_scroll", "timing_window", "streak"],
    preferredCamera: "static",
    physics: { gravity: [0, 0], friction: 0, restitution: 0, timeStep: 1 / 60 },
    requiredEntityKinds: ["beat_lane", "note"],
    uiInstructions: ["Show score/streak", "Show key hint"],
    recognizabilityRules: ["Scrolling notes", "Timing feedback"],
  },
  word_trivia: {
    defaultTemplate: "grid_2d",
    requiredMechanics: ["question", "choices", "timer"],
    preferredCamera: "static",
    physics: { gravity: [0, 0], friction: 0, restitution: 0, timeStep: 1 / 60 },
    requiredEntityKinds: ["question", "choice", "goal"],
    uiInstructions: ["Show prompt", "Show timer/score"],
    recognizabilityRules: ["Question-answer loop", "Time pressure"],
  },
  party_social: {
    defaultTemplate: "topdown_2d",
    requiredMechanics: ["round_timer", "random_objective", "score_rounds"],
    preferredCamera: "topdown",
    physics: { gravity: [0, 0], friction: 0.02, restitution: 0.2, timeStep: 1 / 60 },
    requiredEntityKinds: ["player", "target", "objective"],
    uiInstructions: ["Show round timer", "Show current objective"],
    recognizabilityRules: ["Hot-seat objective", "Timed rounds"],
  },
};

export const PLAYBOOK_SUMMARY = Object.entries(CATEGORY_PLAYBOOKS)
  .map(([category, pb]) => `- ${category}: template=${pb.defaultTemplate}; mechanics=${pb.requiredMechanics.join(",")}; mustHave=${pb.requiredEntityKinds.join(",")}`)
  .join("\n");
