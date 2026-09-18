import type { Position, SuspectId } from "./types";

export type CharacterActionKind =
  | "turn-around"
  | "face-target"
  | "point-at-target"
  | "startled"
  | "face-player";

export interface CharacterVisualAction {
  kind: CharacterActionKind;
  target?: Position;
  startedAt: number;
  until: number;
}

export const ACTION_DURATION_MS = 7000;
export const TURN_AROUND_MS = 1400;

const BANK_EXIT: Position = [1.75, 0, 6.4];
const BANK_DOORS: Position = [0, 0, 14];

function lookTarget(suspectId: SuspectId): Position {
  return suspectId === "lucia" ? BANK_DOORS : BANK_EXIT;
}

export function buildVisualAction(
  kind: CharacterActionKind,
  suspectId: SuspectId,
  options?: { delayMs?: number; durationMs?: number },
): CharacterVisualAction {
  const delayMs = options?.delayMs ?? 0;
  const startedAt = Date.now() + delayMs;
  const durationMs = options?.durationMs ?? ACTION_DURATION_MS;
  return {
    kind,
    target: lookTarget(suspectId),
    startedAt,
    until: startedAt + durationMs,
  };
}

export function isActionActive(action: CharacterVisualAction | null | undefined) {
  if (!action) return false;
  const now = Date.now();
  return now >= action.startedAt && now < action.until;
}

export function turnAroundProgress(action: CharacterVisualAction) {
  const elapsed = Date.now() - action.startedAt;
  if (elapsed <= 0) return 0;
  return Math.min(1, elapsed / TURN_AROUND_MS);
}
