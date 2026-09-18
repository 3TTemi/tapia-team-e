import type { ClueId, SaveGame, SuspectId } from "./types";

export type DemoStepId =
  | "opening"
  | "enter_bank"
  | "collect"
  | "interview_alex"
  | "interview_jordan"
  | "interview_sam"
  | "submit"
  | "complete";

export interface DemoStep {
  id: DemoStepId;
  label: string;
  hint: string;
}

export const CLUE_COUNT = 5;

export const RECOMMENDED_CLUES: Record<SuspectId, ClueId[]> = {
  lucia: [],
  alex: ["photo"],
  jordan: ["log"],
  sam: ["badge", "heat"],
};

export const SAM_DEMO_QUESTION = "Did you stay in the lobby all night?";

const STEPS: Record<Exclude<DemoStepId, "complete">, DemoStep> = {
  opening: {
    id: "opening",
    label: "Prologue",
    hint: "Watch the opening. A courier just fled the bank with the cash.",
  },
  enter_bank: {
    id: "enter_bank",
    label: "Enter the bank",
    hint: "Shift+W through the doors. Follow the gold markers inside.",
  },
  collect: {
    id: "collect",
    label: "Collect evidence",
    hint: "Inspect all 5 markers with E. Read each card, then return to the room.",
  },
  interview_alex: {
    id: "interview_alex",
    label: "Pressure Alex",
    hint: "Talk to Alex (left). Click Manager's office photo — do not type.",
  },
  interview_jordan: {
    id: "interview_jordan",
    label: "Pressure Jordan",
    hint: "Talk to Jordan (right). Click Security inactivity log — then walk away.",
  },
  interview_sam: {
    id: "interview_sam",
    label: "Break Sam",
    hint: `Ask Sam: "${SAM_DEMO_QUESTION}" Then present staff-corridor access, then courier pickup.`,
  },
  submit: {
    id: "submit",
    label: "Close the case",
    hint: "Use the submission terminal by the exit. Select Sam and confirm.",
  },
};

const COMPLETE: DemoStep = {
  id: "complete",
  label: "Case closed",
  hint: "Three secrets. One robbery. Hold the ending card.",
};

function suspectText(game: SaveGame, id: SuspectId) {
  return game.histories[id]
    .filter((m) => m.role === "suspect")
    .map((m) => m.text)
    .join(" ");
}

export function alexAdmitted(game: SaveGame) {
  return /stole the manager's gift liquor|gift liquor/i.test(
    suspectText(game, "alex"),
  );
}

export function jordanAdmitted(game: SaveGame) {
  return /fell asleep|terminal unlocked/i.test(suspectText(game, "jordan"));
}

export function samConfessed(game: SaveGame) {
  return /planned the robbery/i.test(suspectText(game, "sam"));
}

export function computeDemoStep(input: {
  demoMode: boolean;
  cinematic: boolean;
  started: boolean;
  game: SaveGame;
}): DemoStep | null {
  if (!input.demoMode) return null;
  if (input.game.solved) return COMPLETE;
  if (input.cinematic || !input.started) return STEPS.opening;
  if (input.game.clues.length < CLUE_COUNT) {
    return input.game.clues.length === 0 ? STEPS.enter_bank : STEPS.collect;
  }
  if (!alexAdmitted(input.game)) return STEPS.interview_alex;
  if (!jordanAdmitted(input.game)) return STEPS.interview_jordan;
  if (!samConfessed(input.game)) return STEPS.interview_sam;
  return STEPS.submit;
}

export function demoStepIndex(step: DemoStep | null) {
  if (!step || step.id === "complete") return 7;
  const order: DemoStepId[] = [
    "opening",
    "enter_bank",
    "collect",
    "interview_alex",
    "interview_jordan",
    "interview_sam",
    "submit",
  ];
  return order.indexOf(step.id) + 1;
}
