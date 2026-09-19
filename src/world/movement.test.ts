import assert from "node:assert/strict";
import test from "node:test";
import { isWorldBlocked } from "./layout";
import { movePlayer, WALK_SPEED, SPRINT_SPEED } from "./movement";

test("walking covers the same distance at 15fps and 60fps; Shift increases speed", () => {
  for (const fps of [15, 60]) {
    for (const sprint of [false, true]) {
      const position = { x: 0, z: 0 };
      for (let frame = 0; frame < fps; frame++) {
        movePlayer(
          position,
          { forward: 1, side: 0, yaw: 0, deltaSeconds: 1 / fps, sprint },
          () => false,
        );
      }
      assert.ok(
        Math.abs(position.z + (sprint ? SPRINT_SPEED : WALK_SPEED)) < 1e-8,
      );
    }
  }
});

test("diagonal movement cannot increase the selected movement speed", () => {
  const position = { x: 0, z: 0 };
  movePlayer(
    position,
    { forward: 1, side: 1, yaw: 0, deltaSeconds: 0.1, sprint: true },
    () => false,
  );
  assert.ok(
    Math.abs(Math.hypot(position.x, position.z) - SPRINT_SPEED * 0.1) < 1e-8,
  );
});

test("sprinting during a slow frame stops at the cafe glass instead of tunneling through", () => {
  const position = { x: 4, z: 23.6 };
  movePlayer(
    position,
    { forward: 1, side: 0, yaw: 0, deltaSeconds: 0.15, sprint: true },
    isWorldBlocked,
  );
  assert.ok(position.z >= 23.35);
  assert.equal(isWorldBlocked(position.x, position.z), false);
});

test("a long stalled frame cannot produce a large teleport on resume", () => {
  const position = { x: 0, z: 0 };
  movePlayer(
    position,
    { forward: 1, side: 0, yaw: 0, deltaSeconds: 5, sprint: true },
    () => false,
  );
  assert.ok(Math.abs(position.z) <= SPRINT_SPEED * 0.15 + 1e-8);
});
