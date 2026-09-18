import type { Position, SuspectId } from "./types";

export type CharacterActionKind =
  | "face-target"
  | "point-at-target"
  | "startled"
  | "face-player";

export interface CharacterVisualAction {
  kind: CharacterActionKind;
  target?: Position;
  until: number;
}

export const ACTION_DURATION_MS = 6500;

const BANK_EXIT: Position = [1.75, 0, 6.4];
const BANK_DOORS: Position = [0, 0, 14];

function actionUntil(ms = ACTION_DURATION_MS) {
  return Date.now() + ms;
}

function lookTarget(suspectId: SuspectId): Position {
  return suspectId === "lucia" ? BANK_DOORS : BANK_EXIT;
}

export function parsePlayerCommand(
  message: string,
  suspectId: SuspectId,
): CharacterVisualAction | null {
  const text = message.toLowerCase().replace(/[!?.,']/g, " ");
  const target = lookTarget(suspectId);
  const threat =
    /robber|robbery|thief|courier|runner|bandit|criminal|mensajero|ladron/.test(
      text,
    );
  const turn =
    /turn around|turn back|look behind|behind you|mira atras|date vuelta/.test(
      text,
    );
  const look =
    /look at|look toward|watch the|eyes on|mira hacia|mira el/.test(text);
  const point = /point|señala|apunta/.test(text);
  const faceMe = /look at me|face me|eyes on me|mirame/.test(text);
  const startled = /step back|back up|get back|move back|alejate/.test(text);

  if (faceMe)
    return { kind: "face-player", until: actionUntil(4500) };
  if (startled)
    return { kind: "startled", target, until: actionUntil(3200) };
  if (point && (threat || /exit|door|there|way|salida|puerta/.test(text)))
    return { kind: "point-at-target", target, until: actionUntil() };
  if (turn || (look && (threat || /exit|door|salida|puerta/.test(text))))
    return { kind: "face-target", target, until: actionUntil() };
  if (threat && /turn|look|watch|mira|date vuelta/.test(text))
    return { kind: "face-target", target, until: actionUntil() };
  return null;
}

export function commandReaction(
  suspectId: SuspectId,
  kind: CharacterActionKind,
): string {
  if (suspectId === "lucia") {
    if (kind === "point-at-target")
      return "¡Allí! ¡Vi al mensajero salir corriendo por esa puerta!";
    if (kind === "face-target" || kind === "startled")
      return "¿Qué? ¡Espera— vi a alguien salir del banco con una bolsa!";
    if (kind === "face-player") return "Sí, detective. Le escucho.";
    return "¿Qué está pasando?";
  }
  if (kind === "point-at-target")
    return suspectId === "jordan"
      ? "There— by the exit! Someone just blew through!"
      : "That way— toward the doors!";
  if (kind === "face-target")
    return suspectId === "alex"
      ? "What? Behind me? I— I didn't see anyone come in!"
      : suspectId === "jordan"
        ? "Turn around? The exit— someone could've— hold on."
        : "The exit? I wasn't watching the doors!";
  if (kind === "startled")
    return "Whoa— okay, I'm backing up. What did you see?";
  if (kind === "face-player")
    return suspectId === "sam"
      ? "Fine. I'm looking at you."
      : "I'm listening, detective.";
  return "What do you want me to do?";
}

export function isActionActive(action: CharacterVisualAction | null | undefined) {
  return !!action && Date.now() < action.until;
}
