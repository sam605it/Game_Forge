export const ICON_SIZE = 64;

export const PLAYER_ICONS = {
  robot: "🤖",
  bunny: "🐰"
};



export type IconCategory =
  | "sports"
  | "animals"
  | "characters"
  | "hazards"
  | "terrain"
  | "powerups"
  | "objects"
  | "symbols"
  | "fantasy"
  | "ui";

export type IconDef = {
  id: string;
  col: number;
  row: number;
  category: IconCategory;
};

export const ICONS: Record<string, IconDef> = {
  // ROW 0
  golf_ball:        { id: "golf_ball", col: 0, row: 0, category: "sports" },
  hole_flag:        { id: "hole_flag", col: 1, row: 0, category: "sports" },
  golf_hole:        { id: "golf_hole", col: 2, row: 0, category: "sports" },
  basketball:       { id: "basketball", col: 3, row: 0, category: "sports" },
  soccer_ball:      { id: "soccer_ball", col: 4, row: 0, category: "sports" },
  cat_orange:       { id: "cat_orange", col: 5, row: 0, category: "animals" },
  slime_smile:      { id: "slime_smile", col: 6, row: 0, category: "fantasy" },
  slime_round:      { id: "slime_round", col: 7, row: 0, category: "fantasy" },
  ufo:              { id: "ufo", col: 8, row: 0, category: "fantasy" },
  fire_octopus:     { id: "fire_octopus", col: 9, row: 0, category: "fantasy" },

  // ROW 1
  bunny:            { id: "bunny", col: 0, row: 1, category: "animals" },
  hamster:          { id: "hamster", col: 1, row: 1, category: "animals" },
  puppy:            { id: "puppy", col: 2, row: 1, category: "animals" },
  fox:              { id: "fox", col: 3, row: 1, category: "animals" },
  bird_blue:        { id: "bird_blue", col: 4, row: 1, category: "animals" },
  slime_alien:      { id: "slime_alien", col: 5, row: 1, category: "fantasy" },
  robot_basic:      { id: "robot_basic", col: 6, row: 1, category: "characters" },
  horn_item:        { id: "horn_item", col: 7, row: 1, category: "objects" },
  bush_monster:     { id: "bush_monster", col: 8, row: 1, category: "fantasy" },
  fire:             { id: "fire", col: 9, row: 1, category: "hazards" },

  // ROW 2
  slime_fire:       { id: "slime_fire", col: 0, row: 2, category: "fantasy" },
  slime_green:      { id: "slime_green", col: 1, row: 2, category: "fantasy" },
  knight:           { id: "knight", col: 2, row: 2, category: "characters" },
  wizard:           { id: "wizard", col: 3, row: 2, category: "characters" },
  dark_knight:      { id: "dark_knight", col: 4, row: 2, category: "characters" },
  portal:           { id: "portal", col: 5, row: 2, category: "fantasy" },
  brick_wall:       { id: "brick_wall", col: 6, row: 2, category: "terrain" },
  crate:            { id: "crate", col: 7, row: 2, category: "terrain" },
  bush:             { id: "bush", col: 8, row: 2, category: "terrain" },
  ice_block:        { id: "ice_block", col: 9, row: 2, category: "hazards" },

  // ROW 3
  fox_fire:         { id: "fox_fire", col: 0, row: 3, category: "fantasy" },
  bush_round:       { id: "bush_round", col: 1, row: 3, category: "terrain" },
  bird_round:       { id: "bird_round", col: 2, row: 3, category: "animals" },
  robot_bomber:     { id: "robot_bomber", col: 3, row: 3, category: "characters" },
  dome_button:      { id: "dome_button", col: 4, row: 3, category: "objects" },
  fireball:         { id: "fireball", col: 5, row: 3, category: "hazards" },
  planet:           { id: "planet", col: 6, row: 3, category: "fantasy" },
  dwarf:            { id: "dwarf", col: 7, row: 3, category: "characters" },
  devil:            { id: "devil", col: 8, row: 3, category: "fantasy" },
  old_man:          { id: "old_man", col: 9, row: 3, category: "characters" },

  // ROW 4
  slime_blob:       { id: "slime_blob", col: 0, row: 4, category: "fantasy" },
  spikes:           { id: "spikes", col: 1, row: 4, category: "hazards" },
  ice_spikes:       { id: "ice_spikes", col: 2, row: 4, category: "hazards" },
  flame_big:        { id: "flame_big", col: 3, row: 4, category: "hazards" },
  poison_slime:     { id: "poison_slime", col: 4, row: 4, category: "hazards" },
  potion:           { id: "potion", col: 5, row: 4, category: "powerups" },
  trophy:           { id: "trophy", col: 6, row: 4, category: "symbols" },
  star:             { id: "star", col: 7, row: 4, category: "powerups" },
  heart:            { id: "heart", col: 8, row: 4, category: "powerups" },
  key:              { id: "key", col: 9, row: 4, category: "powerups" },

  // ROW 5
  coin:             { id: "coin", col: 0, row: 5, category: "powerups" },
  mushroom:         { id: "mushroom", col: 1, row: 5, category: "terrain" },
  crate_large:      { id: "crate_large", col: 2, row: 5, category: "terrain" },
  bush_square:      { id: "bush_square", col: 3, row: 5, category: "terrain" },
  ice_cube:         { id: "ice_cube", col: 4, row: 5, category: "hazards" },
  rock_block:       { id: "rock_block", col: 5, row: 5, category: "terrain" },
  spiral:           { id: "spiral", col: 6, row: 5, category: "fantasy" },
  bomb:             { id: "bomb", col: 7, row: 5, category: "hazards" },
  skull:            { id: "skull", col: 8, row: 5, category: "hazards" },
  ghost:            { id: "ghost", col: 9, row: 5, category: "fantasy" },

  // ROW 6
  slime_big:        { id: "slime_big", col: 0, row: 6, category: "fantasy" },
  crown:            { id: "crown", col: 1, row: 6, category: "symbols" },
  crown_gold:       { id: "crown_gold", col: 2, row: 6, category: "symbols" },
  hero:             { id: "hero", col: 3, row: 6, category: "characters" },
  demon:            { id: "demon", col: 4, row: 6, category: "fantasy" },
  ghost_white:      { id: "ghost_white", col: 5, row: 6, category: "fantasy" },
  peas_blob:        { id: "peas_blob", col: 6, row: 6, category: "fantasy" },
  cat_gold:         { id: "cat_gold", col: 7, row: 6, category: "animals" },
  crown_red:        { id: "crown_red", col: 8, row: 6, category: "symbols" },
  crown_blue:       { id: "crown_blue", col: 9, row: 6, category: "symbols" },
};

export function resolveIconIdFromText(text: string): string | null {
  const lower = text.toLowerCase();

  // Exact id match first (robot_basic, bunny, etc)
  for (const id of Object.keys(ICONS)) {
    if (lower.includes(id.replace(/_/g, " "))) {
      return id;
    }
  }

  // Fallback: loose match (robot → robot_basic, bunny → bunny)
  for (const id of Object.keys(ICONS)) {
    const token = id.split("_")[0];
    if (lower.includes(token)) {
      return id;
    }
  }

  return null;
}

