import assert from "node:assert/strict";
import test from "node:test";
import { parsePlayerCommand } from "./actions";

test("turn around with robber cue triggers a full spin", () => {
  const action = parsePlayerCommand(
    "Turn around! its the bank robber!",
    "alex",
  );
  assert.equal(action?.kind, "turn-around");
  assert.ok(action?.target);
  assert.equal(action?.target?.[2], 6.4);
});

test("point commands aim toward the exit", () => {
  const action = parsePlayerCommand("Point to the exit!", "jordan");
  assert.equal(action?.kind, "point-at-target");
});

test("face me keeps attention on the detective", () => {
  const action = parsePlayerCommand("Look at me!", "sam");
  assert.equal(action?.kind, "face-player");
});

test("plaza witness spins toward the bank doors", () => {
  const action = parsePlayerCommand("Turn around! The robber!", "lucia");
  assert.equal(action?.kind, "turn-around");
  assert.equal(action?.target?.[2], 14);
});
