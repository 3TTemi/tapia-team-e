export const WALK_SPEED = 4.8;
export const SPRINT_SPEED = 7.2;

interface MovementInput {
  forward: number;
  side: number;
  yaw: number;
  deltaSeconds: number;
  sprint: boolean;
}

// Advance in small collision-tested steps. At 15fps this still covers the same
// distance as 60fps; a suspended tab is capped to prevent a large resume jump.
export function movePlayer(
  position: { x: number; z: number },
  input: MovementInput,
  blocked: (x: number, z: number) => boolean,
) {
  const { forward, side, yaw, sprint } = input;
  const dt = Math.max(0, Math.min(input.deltaSeconds, 0.15));
  const distance =
    (dt * (sprint ? SPRINT_SPEED : WALK_SPEED)) /
    Math.max(1, Math.hypot(forward, side));
  const dx = (-Math.sin(yaw) * forward + Math.cos(yaw) * side) * distance;
  const dz = (-Math.cos(yaw) * forward - Math.sin(yaw) * side) * distance;
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.12));
  for (let i = 0; i < steps; i++) {
    if (!blocked(position.x + dx / steps, position.z)) position.x += dx / steps;
    if (!blocked(position.x, position.z + dz / steps)) position.z += dz / steps;
  }
}
