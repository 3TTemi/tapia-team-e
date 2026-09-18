import { evaluateAccusation } from "./dialogue";
import type { ClueId, SaveGame, SuspectId } from "./types";

export const CASE_PROOF: ClueId[] = ["badge", "heat"];
export type CaseVerdict = {
  status: "solved" | "wrong-suspect";
  suspectId: SuspectId;
};
export type CaseDecision = CaseVerdict;

export function submitCase(game: SaveGame, suspectId: SuspectId) {
  // Demo shortcut: judge the selected culprit without requiring collection.
  const decision: CaseDecision = {
    status: evaluateAccusation(suspectId, "robbery", CASE_PROOF)
      ? "solved"
      : "wrong-suspect",
    suspectId,
  };
  // A failed attempt never removes collected clues or interview history.
  return {
    decision,
    game: decision.status === "solved" ? { ...game, solved: true } : game,
  };
}
