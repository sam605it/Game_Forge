# Renderer Contract (GameSpecV1)

This document reflects the **actual** contract required by the runtime renderer in
`/lib/runtime/engine.ts` and the shared `GameSpecV1` type in `/types.ts`.

## Required top-level fields
- `id` (string)
- `title` (string)
- `category` (one of 12 categories)
- `description` (string)
- `assets` (string[])
- `world` object
  - `size.width` (number)
  - `size.height` (number)
  - `physics.gravity` ([number, number])
  - `physics.friction` (number)
  - `physics.restitution` (number)
  - `physics.timeStep` (number)
  - `camera.mode` (`static` | `follow`)
- `entities` (Entity[])
- `rules` (Rule[])
- `controls.scheme` (supported control scheme)
- `controls.mappings` (object with key arrays)
- `ui.hud` (array)

## Allowed enums
- Categories: `sports`, `racing`, `action`, `shooter`, `platformer`, `puzzle`, `strategy`, `arcade`,
  `simulation`, `rhythm_music`, `word_trivia`, `party_social`
- Control schemes: `keyboard_move`, `mouse_aim_shoot`, `drag_launch`, `click_place`, `swipe_move`
- Rule types: `score`, `timer`, `lives`, `rounds`, `checkpoints`, `win_on_goal`, `win_on_score`,
  `lose_on_lives`, `lose_on_timer`
- Entity kinds: `player`, `enemy`, `projectile`, `goal`, `wall`, `hazard`, `pickup`, `spawner`,
  `decor`, `npc`
- Render shapes: `circle`, `rect`, `line`
- Collider types: `rect`, `circle`

## Required entity fields
- `id` (string)
- `kind` (enum)
- `position` `{ x, y }`
- `velocity` `{ x, y }`
- `size` `{ width, height }`
- `rotation` (number)
- `render` `{ type, shape?, emoji?, color? }`
- `collider` `{ type, isStatic, isSensor? }`
- `tags` (string[] optional)

## Required runtime assumptions
- Exactly one controllable player must exist (`kind === "player"` or tag `player`).
- Player spawn must be inside world bounds.
- A win condition must exist (`win_on_goal` or `win_on_score`).
- If `win_on_goal` is present, a goal entity/tag must exist.
- Entity counts must remain within a safe cap (<= 80) to avoid perf issues.
- All numbers must be finite (no NaN/Infinity).

## Allowed templates
The runtime does **not** consume a template enum directly. The build pipeline must
select a template **before** rendering and must map categories to known templates:
- topdown: `dodge_arena`, `topdown_shooter`, `tower_defense`, `racing_time_trial`, `capture_flag`
- platformer: `platformer`, `runner`
- grid: `grid_puzzle`, `trivia_quiz`
- physics: `minigolf`, `pinball`
- rhythm: `rhythm_tap`

## Required per-template entities (enforced by builder/repair)
- Topdown: `player`, `goal`, at least one `enemy` or `hazard`
- Platformer: `player`, `goal`, at least one `wall`/platform
- Grid: `goal` plus at least one `wall` or `pickup`
- Physics: `player` and `goal` (mini‑golf ball + hole)
- Rhythm: `player` and `goal` plus a `timer` or `score` rule

## Known failure cases
- Missing or invalid `controls.mappings` (causes runtime inputs to be undefined).
- Missing `player` or `goal` tags (win condition cannot resolve).
- Invalid entity kinds/shapes (renderer assumes known enums).
- `ui.hud` missing or malformed (HUD rendering errors).
- Non‑finite numbers (physics and renderer loops break).
- Excessive entities (perf degradation or crashes).
