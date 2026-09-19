import { evaluateAccusation } from "./dialogue";
import type { ClueId, SaveGame, SuspectId } from "./types";

export const CASE_PROOF: ClueId[] = ["badge", "heat"];
export type CaseVerdict = {
  status: "solved" | "wrong-suspect";
  suspectId: SuspectId;
};
export type CaseDecision =
  CaseVerdict | { status: "insufficient-evidence"; missing: ClueId[] };

export function submitCase(game: SaveGame, suspectId: SuspectId) {
  const missing = CASE_PROOF.filter((id) => !game.clues.includes(id));
  const decision: CaseDecision = missing.length
    ? { status: "insufficient-evidence", missing }
    : {
        status: evaluateAccusation(suspectId, "robbery", game.clues)
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
