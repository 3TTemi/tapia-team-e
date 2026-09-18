import { currentCharacterNames } from "./names";
import type { SaveGame } from "./types";
import { clueIdsOnCollect, clues, characters } from "./case";
import type { ClueId } from "./types";

const COLLECTABLE_CLUES = new Set(
  clues.flatMap((clue) => clueIdsOnCollect(clue)),
);

const KEY = "last-commit-bank-save-v2";
export const freshGame = (): SaveGame => ({
  version: 1,
  clues: [],
  histories: { alex: [], jordan: [], sam: [], lucia: [] },
  solved: false,
});
export function loadGame(): SaveGame {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (
      raw?.version !== 1 ||
      !Array.isArray(raw.clues) ||
      !raw.histories ||
      typeof raw.solved !== "boolean"
    )
      return freshGame();
    if (
      !raw.clues.every((id: unknown) => COLLECTABLE_CLUES.has(id as ClueId))
    )
      return freshGame();
    raw.histories.lucia ??= [];
    for (const s of characters) {
      if (
        !Array.isArray(raw.histories[s.id]) ||
        !raw.histories[s.id].every(
          (m: { role?: unknown; text?: unknown }) =>
            m &&
            ["player", "suspect"].includes(String(m.role)) &&
            typeof m.text === "string",
        )
      )
        return freshGame();
    }
    for (const history of Object.values((raw as SaveGame).histories)) {
      for (const message of history)
        message.text = currentCharacterNames(message.text);
    }
    return raw as SaveGame;
  } catch {
    return freshGame();
  }
}
export function persistGame(game: SaveGame): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(game));
    return true;
  } catch {
    return false;
  }
}
