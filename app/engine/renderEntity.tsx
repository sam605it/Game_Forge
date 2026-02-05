export function renderEntity(entity: any) {
  switch (entity.type) {
    case "player":
    case "snake":
      return "🟩";
    case "enemy":
      return "👾";
    case "food":
    case "orb":
      return "🔵";
    case "wall":
      return "⬛";
    default:
      return "❓";
  }
}
