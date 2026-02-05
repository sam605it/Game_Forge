export type Entity =
  | { kind: "ball"; x: number; y: number }
  | { kind: "hole"; x: number; y: number; radius: number };

export type GameState = {
  type: "mini-golf";
  world: {
    width: number;
    height: number;
  };
  entities: Entity[];
  rules: {
    friction: number;
  };
};
