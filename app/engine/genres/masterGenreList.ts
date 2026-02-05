import { GenreDefinition } from "./genreTypes";

export const MASTER_GENRES: GenreDefinition[] = [
  {
    id: "sports",
    name: "Sports & Physics",
    description: "Physics-based goal-oriented games",
    themes: [
      { id: "mini_golf", name: "Mini Golf", description: "Classic mini golf" },
      { id: "bunny_golf", name: "Bunny Golf", description: "Golf with a bunny" },
      { id: "lava_golf", name: "Lava Golf", description: "Avoid lava hazards" },
      { id: "soccer", name: "Soccer", description: "Score goals" },
      { id: "pinball", name: "Pinball", description: "Bounce-based scoring" },
      { id: "bowling", name: "Bowling", description: "Knock down pins" }
    ]
  },

  {
    id: "racing",
    name: "Racing & Movement",
    description: "Speed and reaction games",
    themes: [
      { id: "top_down_racing", name: "Top-Down Racing", description: "Arcade racing" },
      { id: "endless_runner", name: "Endless Runner", description: "Run forever" },
      { id: "hover_race", name: "Hover Race", description: "Low gravity racing" }
    ]
  },

  {
    id: "platformer",
    name: "Platformers",
    description: "Jumping and timing games",
    themes: [
      { id: "classic_platformer", name: "Classic Platformer", description: "Jump & run" },
      { id: "precision_jump", name: "Precision Jump", description: "Hard jumps" },
      { id: "lava_rise", name: "Lava Rise", description: "Escape rising lava" }
    ]
  },

  {
    id: "puzzle",
    name: "Puzzle & Logic",
    description: "Thinky brain games",
    themes: [
      { id: "block_push", name: "Block Push", description: "Push blocks" },
      { id: "laser_puzzle", name: "Laser Puzzle", description: "Reflect lasers" },
      { id: "switch_door", name: "Switch & Door", description: "Flip switches" }
    ]
  },

  {
    id: "shooter",
    name: "Shooter & Action",
    description: "Aiming and survival",
    themes: [
      { id: "arena_shooter", name: "Arena Shooter", description: "Survive waves" },
      { id: "target_practice", name: "Target Practice", description: "Hit targets" }
    ]
  },

  {
    id: "party",
    name: "Party & Chaos",
    description: "Fun and unpredictable",
    themes: [
      { id: "bomb_dodge", name: "Bomb Dodge", description: "Avoid bombs" },
      { id: "tag_game", name: "Tag Game", description: "Chase and tag" }
    ]
  },

  {
    id: "simulation",
    name: "Simulation & Sandbox",
    description: "Systems and interactions",
    themes: [
      { id: "sandbox", name: "Sandbox", description: "Free play" },
      { id: "physics_lab", name: "Physics Lab", description: "Experiment" }
    ]
  },

  {
    id: "rpg",
    name: "RPG & Adventure",
    description: "Progression and quests",
    themes: [
      { id: "dungeon", name: "Dungeon", description: "Explore dungeons" },
      { id: "boss_rush", name: "Boss Rush", description: "Fight bosses" }
    ]
  },

  {
    id: "rhythm",
    name: "Rhythm & Timing",
    description: "Music-based games",
    themes: [
      { id: "beat_tap", name: "Beat Tap", description: "Tap to rhythm" },
      { id: "music_runner", name: "Music Runner", description: "Run to beat" }
    ]
  },

  {
    id: "idle",
    name: "Idle & Incremental",
    description: "Numbers go up",
    themes: [
      { id: "clicker", name: "Clicker", description: "Tap to grow" },
      { id: "idle_defense", name: "Idle Defense", description: "Automated defense" }
    ]
  }
];
