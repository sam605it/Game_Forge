import { PhysicsWorld } from "./types";

export function createWorld(overrides?: Partial<PhysicsWorld>): PhysicsWorld {
  return {
    gravity: -9.8,
    friction: 0.98,
    bodies: [],
    ...overrides,
  };
}
