# GameSpec v1

GameSpec v1 is the strict JSON contract used by the chatbox minigame generator. The app asks AI for a spec, validates it, normalizes it, and renders it into a playable template.

## The 7 required top-level sections

1. `metadata`
2. `world`
3. `entities`
4. `components`
5. `rules`
6. `assets`
7. `constraints`

All seven are required.

## Categories (12 values)

- `sports`
- `puzzle`
- `arcade`
- `action`
- `racing`
- `platformer`
- `shooter`
- `strategy`
- `simulation`
- `rhythm_music`
- `word_trivia`
- `party_social`

## Category to template mapping

- `sports` → `physics_2d`
- `simulation` → `physics_2d`
- `platformer` → `platformer_2d`
- `puzzle` → `grid_2d`
- `word_trivia` → `grid_2d`
- `rhythm_music` → `rhythm_2d`
- `arcade` / `action` / `racing` / `shooter` / `strategy` / `party_social` → `topdown_2d`

Validator behavior: if category is valid but template is wrong or missing, it is auto-corrected to the default mapping.

## Mechanics vocabulary (v1 starter)

`mechanics` is required and non-empty. Suggested starter vocabulary:

- `drag_shot`
- `gravity`
- `collisions`
- `bounce`
- `knockdown`
- `lane_physics`
- `goal_trigger`
- `timer`
- `waves`
- `collect`
- `dodge`
- `jump`
- `shoot`
- `steer`
- `grid_move`
- `match`
- `word_guess`
- `rhythm_hit`
- `decor_scatter`

## Minimal valid JSON example

```json
{
  "metadata": {
    "version": "1.0",
    "title": "Minimal Demo",
    "category": "sports",
    "template": "physics_2d",
    "mechanics": ["drag_shot"]
  },
  "world": {
    "physics": { "gravity": [0, 300], "friction": 0.04, "restitution": 0.35 },
    "camera": { "mode": "static" }
  },
  "entities": [
    {
      "id": "player",
      "kind": "ball",
      "components": {
        "Transform": { "pos": [80, 120] },
        "InputController": { "scheme": "drag_shot" },
        "Goal": { "type": "enter_trigger", "target": "goal" }
      }
    }
  ],
  "components": { "supported": ["Transform", "InputController", "Goal"] },
  "rules": [
    {
      "when": { "event": "GoalReached", "entity": "goal" },
      "do": [{ "action": "EndRound", "result": "win" }]
    }
  ],
  "assets": { "sprites": { "player": "sprite:player" }, "sounds": { "win": "sfx:win" } },
  "constraints": { "maxEntities": 100, "maxSounds": 8, "targetFPS": 60 }
}
```

## “Millions of combinations” approach

The combinatorial power comes from independent mix-and-match dimensions:

- category (`sports`, `puzzle`, etc.)
- mechanics (required list)
- entities (`bunny_ball`, `tree`, `giant_bunny_statue`)
- components (`Spawner`, `Goal`, `InputController`, etc.)
- rules (event → action chains)
- assets placeholder IDs (`sprite:*`, `sfx:*`)
- procedural generators (`Spawner` scatter, wave spawns, lane layouts)

By combining these dimensions under one strict schema, you can generate a huge space of playable minigames while keeping runtime validation safe.
