export const SUPPORTED_ENTITY_TYPES = ["ball", "goal", "cup", "wall", "bumper", "hazard", "decor"] as const;

export const SUPPORTED_SHAPES = ["circle", "rect", "line"] as const;

export const SUPPORTED_CONTROLS = ["mouse_drag_shot", "click_shot", "keyboard_move"] as const;

export const SUPPORTED_RULES = ["strokes", "score", "timer", "win_on_goal", "lose_on_timer"] as const;

export const ENGINE_CAPABILITIES = {
  entityTypes: SUPPORTED_ENTITY_TYPES,
  shapes: SUPPORTED_SHAPES,
  controls: SUPPORTED_CONTROLS,
  rules: SUPPORTED_RULES,
} as const;
