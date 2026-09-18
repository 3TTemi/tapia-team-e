import assert from "node:assert/strict";
import test from "node:test";
import { freshGame } from "./save";
import { submitCase } from "./submission";
import type { ClueId, SuspectId } from "./types";

test("demo submission permits a verdict with any number of collected records", () => {
  const ids: ClueId[] = ["dock", "log", "photo", "badge", "heat"];
  for (let mask = 0; mask < 32; mask++) {
    const game = {
      ...freshGame(),
      clues: ids.filter((_, i) => mask & (1 << i)),
    };
    for (const suspect of ["alex", "jordan", "sam"] as SuspectId[]) {
      const result = submitCase(game, suspect);
      assert.equal(
        result.decision.status,
        suspect === "sam" ? "solved" : "wrong-suspect",
      );
      assert.equal(result.game.solved, suspect === "sam");
      if (!result.game.solved) assert.equal(result.game, game);
    }
  }
});

test("wrong choice and retry preserve every clue and interview, then close the case", () => {
  const game = freshGame();
  game.clues = ["badge", "heat", "photo"];
  game.histories.sam = [{ role: "suspect", text: "Recorded statement." }];
  const wrong = submitCase(game, "alex");
  assert.equal(wrong.decision.status, "wrong-suspect");
  assert.deepEqual(wrong.game, game);
  const correct = submitCase(wrong.game, "sam");
  assert.equal(correct.decision.status, "solved");
  assert.equal(correct.game.solved, true);
  assert.equal(correct.game.clues, game.clues);
  assert.equal(correct.game.histories, game.histories);
  assert.equal(game.solved, false, "the existing save must not be mutated");
  assert.equal(freshGame().solved, false);
  assert.deepEqual(freshGame().clues, []);
});

test("demo can finish without evidence or interviews", () => {
  const game = freshGame();
  const result = submitCase(game, "sam");
  assert.deepEqual(result.decision, {
    status: "solved",
    suspectId: "sam",
  });
  assert.equal(result.game.solved, true);
});
