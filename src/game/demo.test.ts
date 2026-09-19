import test from "node:test";
import assert from "node:assert/strict";
import {
  alexAdmitted,
  computeDemoStep,
  jordanAdmitted,
  samConfessed,
} from "./demo";
import { freshGame } from "./save";
import type { SaveGame } from "./types";

const base = {
  demoMode: true,
  cinematic: false,
  started: true,
};

test("demo step advances through the rehearsed route", () => {
  assert.equal(
    computeDemoStep({ ...base, cinematic: true, game: freshGame() })?.id,
    "opening",
  );
  assert.equal(
    computeDemoStep({ ...base, game: freshGame() })?.id,
    "enter_bank",
  );
  const collecting: SaveGame = {
    ...freshGame(),
    clues: ["photo"],
  };
  assert.equal(
    computeDemoStep({ ...base, game: collecting })?.id,
    "collect",
  );
  const ready: SaveGame = {
    ...freshGame(),
    clues: ["log", "photo", "badge", "heat"],
  };
  assert.equal(computeDemoStep({ ...base, game: ready })?.id, "interview_alex");
  ready.histories.alex = [
    {
      role: "suspect",
      text: "Fine. I stole the manager's gift liquor.",
    },
  ];
  assert.equal(
    computeDemoStep({ ...base, game: ready })?.id,
    "interview_jordan",
  );
  ready.histories.jordan = [
    { role: "suspect", text: "All right. I fell asleep." },
  ];
  assert.equal(computeDemoStep({ ...base, game: ready })?.id, "interview_sam");
  ready.histories.sam = [
    { role: "suspect", text: "I planned the robbery." },
  ];
  assert.equal(computeDemoStep({ ...base, game: ready })?.id, "submit");
  assert.equal(
    computeDemoStep({ ...base, game: { ...ready, solved: true } })?.id,
    "complete",
  );
});

test("admission helpers match scripted disclosure lines", () => {
  const game = freshGame();
  assert.equal(alexAdmitted(game), false);
  game.histories.alex = [
    { role: "suspect", text: "Fine. I stole the manager's gift liquor." },
  ];
  assert.equal(alexAdmitted(game), true);
  game.histories.jordan = [
    { role: "suspect", text: "All right. I fell asleep." },
  ];
  assert.equal(jordanAdmitted(game), true);
  game.histories.sam = [
    { role: "suspect", text: "I planned the robbery." },
  ];
  assert.equal(samConfessed(game), true);
});
