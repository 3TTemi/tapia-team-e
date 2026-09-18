import type { Clue, Suspect } from "./types";

// Public world content. Dialogue rules live separately in dialogue.ts.
export const suspects: Suspect[] = [
  {
    id: "alex",
    name: "Alex",
    role: "BANK JANITOR",
    color: "#ae9fff",
    position: [-4.3, 0, -1.6],
    opening:
      "Missing cash? I mop floors, detective. I kept to the lobby. Nobody needs to bother the manager about me.",
  },
  {
    id: "jordan",
    name: "Jordan",
    role: "SECURITY GUARD",
    color: "#f2ab72",
    position: [4.3, 0, -1.6],
    opening:
      "I watched the cameras all evening. Nothing unusual. This bank is secure. Was secure.",
  },
  {
    id: "sam",
    name: "Sam",
    role: "REGULAR CUSTOMER · CONTRACTOR",
    color: "#83d8b1",
    position: [3.4, 0, -6.8],
    opening:
      "Terrible business. I only came to collect my repair invoice. I stayed in the public lobby, but I’m happy to help.",
  },
];

export const translationWitness: Suspect = {
  id: "lucia",
  name: "Gabby",
  role: "WITNESS · ESPAÑOL",
  color: "#59bfc0",
  position: [-3.2, 0, 19.5],
  opening:
    "Hola, soy Gabby. Vi a un mensajero recoger una bolsa del banco. Puedo contarte lo que vi.",
};
export const witnessOpeningTranslation =
  "Hi, I’m Gabby. I saw a courier collect a bag from the bank. I can tell you what I saw.";
export const characters: Suspect[] = [...suspects, translationWitness];

export const clues: Clue[] = [
  {
    id: "log",
    title: "Security inactivity log",
    category: "SECURITY RECORD",
    position: [-5.3, 1.4, -4.5],
    icon: ">_",
    description:
      "17:55–18:06 — no camera checks or patrol check-ins from Jordan.\nThe security terminal stayed signed in and unlocked.\nJordan claims he watched the cameras the whole time.",
  },
  {
    id: "photo",
    title: "Manager’s office photo",
    category: "CAMERA STILL",
    position: [5.2, 1.15, -4.5],
    icon: "▣",
    description:
      "17:59 — the office camera caught Alex putting the manager’s gift bottle into his cleaning cart. He said he never left the lobby. The office door looks onto the staff corridor.",
  },
  {
    id: "heat",
    title: "Contractor pickup file",
    category: "ACCESS & DISPATCH",
    position: [0, 1.1, -7.8],
    icon: "ϟ",
    grants: ["badge", "heat"],
    description:
      "18:01 — staff corridor opened with contractor pass E-17: Sam.\n18:02 — bank security terminal: unscheduled cash pickup booked under Sam’s E-17 account.\nRunner instruction: ‘Collect the sealed cash bag at 18:04. Bring it to me behind the bank.’",
  },
];

export function clueIdsOnCollect(clue: Clue) {
  return clue.grants ?? [clue.id];
}

export function isClueCollected(clue: Clue, collected: Clue["id"][]) {
  return clueIdsOnCollect(clue).every((id) => collected.includes(id));
}

export function collectedWorldClueCount(collected: Clue["id"][]) {
  return clues.filter((clue) => isClueCollected(clue, collected)).length;
}

// Shared by rendered furniture and player collision. x/z are center coordinates.
export const obstacles = [
  { x: -4.5, z: -4.5, width: 3.6, depth: 1.5 },
  { x: 4.5, z: -4.5, width: 3.6, depth: 1.5 },
  { x: 0, z: -7.8, width: 2.5, depth: 1.1 },
];
