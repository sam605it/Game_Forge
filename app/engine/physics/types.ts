export type Vector = {
  x: number;
  y: number;
};

export type PhysicsBody = {
  id: string;

  position: Vector;
  velocity: Vector;

  radius?: number;      // for circles (golf balls, players)
  width?: number;       // for boxes
  height?: number;

  isStatic?: boolean;   // walls, ground
};

export type PhysicsWorld = {
  gravity: number;
  friction: number;
  bodies: PhysicsBody[];
};
