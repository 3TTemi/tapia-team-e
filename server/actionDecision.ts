import type { CharacterActionKind } from "../src/game/actions";
import { buildVisualAction } from "../src/game/actions";
import type { AIConfig } from "./gemini";
import type { SuspectId } from "../src/game/types";

export const ACTION_DECISION_DELAY_MS = 1600;
export const actionDecisionSchema = {
  type: "OBJECT",
  properties: {
    action: {
      type: "STRING",
      enum: [
        "none",
        "turn-around",
        "face-target",
        "point-at-target",
        "startled",
        "face-player",
      ],
    },
  },
  required: ["action"],
};

const allowed = new Set<string>(actionDecisionSchema.properties.action.enum);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function decideCharacterAction(
  input: {
    suspectId: SuspectId;
    message: string;
    characterName: string;
    persona: string;
  },
  config: AIConfig,
  generate: (
    config: AIConfig,
    system: string,
    user: string,
    schema: object,
  ) => Promise<unknown>,
  delayMs = ACTION_DECISION_DELAY_MS,
) {
  if ((!config.apiKey && !config.openaiApiKey) || config.scripted) return null;

  try {
  const system = `You decide whether a fictional witness physically acts in response to the detective's latest message.
Choose exactly one action:
- none: normal conversation, questions, denials, or presenting evidence
- turn-around: player commands them to turn around, look behind, or spin toward a threat
- face-target: player urges them to look toward the exit, doors, robber, or courier
- point-at-target: player tells them to point at something specific
- startled: player tells them to step back, freeze, or react in alarm
- face-player: player demands eye contact or attention on the detective

Only pick a non-none action when the player clearly directs physical behavior. Do not invent actions for ordinary interview questions.`;

  const decision = generate(
    config,
    system,
    JSON.stringify({
      character: input.characterName,
      persona: input.persona,
      playerMessage: input.message,
    }),
    actionDecisionSchema,
  );

  const [, raw] = await Promise.all([sleep(delayMs), decision]);
  const action = (raw as { action?: unknown })?.action;
  if (typeof action !== "string" || !allowed.has(action) || action === "none")
    return null;
  return buildVisualAction(action as CharacterActionKind, input.suspectId);
  } catch {
    return null;
  }
}
