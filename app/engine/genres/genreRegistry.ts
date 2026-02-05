import { MASTER_GENRES } from "./masterGenreList";
import type { GenreDefinition } from "./genreTypes";

/**
 * Fast genre lookup by id
 */
export const GENRE_REGISTRY = Object.fromEntries(
  MASTER_GENRES.map(genre => [genre.id, genre])
) as Record<string, GenreDefinition>;

/**
 * Fast theme lookup by id
 */
export const THEME_REGISTRY = Object.fromEntries(
  MASTER_GENRES.flatMap(genre =>
    genre.themes.map(theme => [theme.id, theme])
  )
) as Record<string, GenreDefinition["themes"][number]>;

/**
 * Backwards-compatible helper
 */
export function getThemeById(themeId: string) {
  return THEME_REGISTRY[themeId] ?? null;
}
