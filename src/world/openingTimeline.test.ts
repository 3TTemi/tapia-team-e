import assert from "node:assert/strict";
import test from "node:test";
import { obstacles } from "../game/case";
import { isWorldBlocked } from "./layout";
import {
  OPENING_DURATION,
  OPENING_HANDOFF,
  OPENING_LOOK_AT,
  openingFrame,
} from "./openingTimeline";

test("completion and a late/skipped timeline reach the same playable camera", () => {
  const complete = openingFrame(OPENING_DURATION);
  assert.deepEqual(complete, openingFrame(1000));
  assert.deepEqual(complete.camera, OPENING_HANDOFF);
  assert.deepEqual(complete.lookAt, OPENING_LOOK_AT);
  assert.equal(complete.fov, 65);
  assert.equal(complete.flash, 0);
  assert.equal(complete.smoke, 0);
  assert.equal(complete.emergency, 0);
  assert.equal(
    isWorldBlocked(complete.camera[0], complete.camera[2], obstacles),
    false,
  );
  for (let z = complete.camera[2]; z >= 5; z -= 0.1) {
    assert.equal(
      isWorldBlocked(0, z, obstacles),
      false,
      `Bank approach blocked at ${z}`,
    );
  }
});

test("the detective and fleeing figure stay on clear paths through the entrances", () => {
  for (let t = 5; t <= 8.25; t += 0.05) {
    const { player, runner } = openingFrame(t);
    assert.equal(
      isWorldBlocked(player[0], player[2], obstacles),
      false,
      `Detective blocked at ${t}`,
    );
    assert.equal(
      isWorldBlocked(runner[0], runner[2], obstacles),
      false,
      `Runner blocked at ${t}`,
    );
  }
});

test("the ten-second opening includes distinct third-person shots and a continuous final camera move", () => {
  assert.equal(OPENING_DURATION, 10);
  assert.equal(openingFrame(2.9).shot, "cafe");
  assert.equal(openingFrame(3).shot, "blast");
  assert.equal(openingFrame(5).shot, "escape");
  assert.equal(openingFrame(8).shot, "handoff");
  assert.deepEqual(openingFrame(0).camera, openingFrame(-1).camera);
  const before = openingFrame(7.999).camera;
  const after = openingFrame(8).camera;
  assert.ok(Math.hypot(...before.map((value, i) => value - after[i])) < 0.001);
  assert.ok(openingFrame(3).flash > 0.9);
  assert.equal(openingFrame(4).flash, 0);
});
