import type { Category } from "@/engine/categories";

export type TemplateKind = "topdown" | "platformer" | "grid" | "physics" | "rhythm";

export const resolveTemplateKind = (category: Category): TemplateKind => {
  switch (category) {
    case "platformer":
      return "platformer";
    case "puzzle":
    case "word_trivia":
      return "grid";
    case "sports":
      return "physics";
    case "rhythm_music":
      return "rhythm";
    case "simulation":
      return "topdown";
    default:
      return "topdown";
  }
};

export const resolveTemplateIdForCategory = (category: Category): string => {
  switch (category) {
    case "sports":
      return "minigolf";
    case "racing":
      return "racing_time_trial";
    case "action":
      return "dodge_arena";
    case "shooter":
      return "topdown_shooter";
    case "platformer":
      return "platformer";
    case "puzzle":
      return "grid_puzzle";
    case "strategy":
      return "tower_defense";
    case "arcade":
      return "dodge_arena";
    case "simulation":
      return "farming_sim";
    case "rhythm_music":
      return "rhythm_tap";
    case "word_trivia":
      return "trivia_quiz";
    case "party_social":
      return "capture_flag";
    default:
      return "dodge_arena";
  }
};
