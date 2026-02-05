// app/engine/normalizeBlueprint.ts

export function normalizeBlueprint(raw: any) {
  return {
    meta: {
      title: raw?.meta?.title ?? raw?.title ?? "Untitled Game",
    },

    world: {
      width: raw?.world?.width ?? 800,
      height: raw?.world?.height ?? 500,
      tileSize: raw?.world?.tileSize ?? 50,
      background: raw?.world?.background ?? "#0b0b0b",
    },

    entities: Array.isArray(raw?.entities) ? raw.entities : [],

    rules: raw?.rules ?? {},
  };
}
