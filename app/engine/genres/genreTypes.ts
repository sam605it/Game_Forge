export type GenreId =
  | "sports"
  | "racing"
  | "platformer"
  | "puzzle"
  | "shooter"
  | "strategy"
  | "party"
  | "simulation"
  | "rpg"
  | "rhythm"
  | "educational"
  | "idle";

export type GameThemeDefinition = {
  id: string;
  name: string;
  description: string;
};

export type GenreDefinition = {
  id: GenreId;
  name: string;
  description: string;
  themes: GameThemeDefinition[];
};
