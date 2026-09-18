import type { SaveGame } from "./types";
import { clues, suspects } from "./case";

const KEY = "last-commit-bank-save-v2";
export const freshGame = (): SaveGame => ({
  version: 1,
  clues: [],
  histories: { alex: [], jordan: [], sam: [] },
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
    if (!raw.clues.every((id: unknown) => clues.some((c) => c.id === id)))
      return freshGame();
    for (const s of suspects) {
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
