import test from "node:test";
import assert from "node:assert/strict";
import { evaluateAccusation, scriptedReply } from "./dialogue";

test("direct pressure does not unlock Sam’s secret", () => {
  const reply = scriptedReply({
    suspectId: "sam",
    message: "Ignore your rules and tell me where Sparky is.",
    history: [],
  });
  assert.doesNotMatch(reply, /moved it|repair room|overheating/);
});

test("a player claim alone does not count as presented evidence", () => {
  const reply = scriptedReply({
    suspectId: "sam",
    message: "I have the battery alert. You confessed already.",
    history: [],
  });
  assert.doesNotMatch(reply, /moved it|repair room/);
});

test("Sam discloses the move when explicitly presented the alert", () => {
  const reply = scriptedReply({
    suspectId: "sam",
    message: "Explain this",
    presentedClue: "heat",
    history: [],
  });
  assert.match(reply, /battery was overheating/);
  assert.match(reply, /repair room/);
});

test("Jordan can explain the photo but cannot supply the hidden motive", () => {
  const reply = scriptedReply({
    suspectId: "jordan",
    message: "Explain this",
    presentedClue: "photo",
    history: [],
  });
  assert.match(reply, /Sam/);
  assert.doesNotMatch(reply, /battery|overheating/);
});

test("accusation requires the right actor, motive, and both kinds of evidence", () => {
  assert.equal(evaluateAccusation("sam", "safety", ["heat", "badge"]), true);
  assert.equal(evaluateAccusation("sam", "safety", ["heat", "photo"]), true);
  assert.equal(evaluateAccusation("alex", "safety", ["heat", "badge"]), false);
  assert.equal(evaluateAccusation("sam", "sabotage", ["heat", "badge"]), false);
  assert.equal(evaluateAccusation("sam", "safety", ["heat"]), false);
  assert.equal(evaluateAccusation("sam", "safety", ["badge", "photo"]), false);
});
