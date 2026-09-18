import assert from "node:assert/strict";
import test from "node:test";
import {
  buildVisualAction,
  isActionActive,
  turnAroundProgress,
} from "./actions";

test("buildVisualAction can delay the start of a physical reaction", () => {
  const action = buildVisualAction("turn-around", "jordan", {
    delayMs: 500,
    durationMs: 3000,
  });
  assert.equal(isActionActive(action), false);
  assert.equal(turnAroundProgress(action), 0);
  action.startedAt = Date.now() - 200;
  assert.equal(isActionActive(action), true);
  assert.ok(turnAroundProgress(action) > 0);
});

test("turn-around actions aim bank suspects at the exit", () => {
  const action = buildVisualAction("turn-around", "alex");
  assert.equal(action.target?.[2], 6.4);
});

test("plaza witness actions aim at the bank doors", () => {
  const action = buildVisualAction("face-target", "lucia");
  assert.equal(action.target?.[2], 14);
});
