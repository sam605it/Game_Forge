import { PhysicsWorld, PhysicsBody } from "./types";

const TIME_STEP = 1 / 60;

export function stepWorld(world: PhysicsWorld) {
  for (const body of world.bodies) {
    if (body.isStatic) continue;

    // Apply gravity
    body.velocity.y += world.gravity * TIME_STEP;

    // Apply friction
    body.velocity.x *= world.friction;
    body.velocity.y *= world.friction;

    // Integrate position
    body.position.x += body.velocity.x;
    body.position.y += body.velocity.y;

    // Simple ground collision
    if (body.position.y > 0) {
      body.position.y = 0;
      body.velocity.y *= -0.4; // bounce
    }
  }

  return world;
}
