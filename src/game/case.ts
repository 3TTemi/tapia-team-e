import type { Clue, Suspect } from "./types";

// Public world content. Dialogue rules live separately in dialogue.ts.
export const suspects: Suspect[] = [
  {
    id: "alex",
    name: "Alex",
    role: "YOUR TEAMMATE",
    color: "#ae9fff",
    position: [-4.3, 0, -1.6],
    opening:
      "Sparky is missing? Okay. Okay. Before we panic… did you check the build logs?",
  },
  {
    id: "jordan",
    name: "Jordan",
    role: "THE RIVAL",
    color: "#f2ab72",
    position: [4.3, 0, -1.6],
    opening:
      "Rough timing. Thirteen minutes before judging? I was at the snack table. Mostly.",
  },
  {
    id: "sam",
    name: "Sam",
    role: "EVENT VOLUNTEER",
    color: "#83d8b1",
    position: [3.4, 0, -6.8],
    opening:
      "Everything is under control. Please keep the aisles clear. And… don’t touch any loose batteries.",
  },
];

export const clues: Clue[] = [
  {
    id: "dock",
    title: "Empty charging dock",
    category: "SCENE OF THE DISAPPEARANCE",
    position: [-3.6, 1.15, -4.5],
    icon: "◇",
    description:
      "Sparky’s dock is empty. The charging cable was carefully unplugged, not torn out. There’s a faint scorch mark beneath the battery connector.",
  },
  {
    id: "log",
    title: "Build failure log",
    category: "DIGITAL EVIDENCE",
    position: [-5.3, 1.4, -4.5],
    icon: ">_",
    description:
      "23:39 — deploy failed. User: alex.\n23:40 — dashboard message changed to “DEMO CANCELLED.”\nThe message predates Sparky’s disappearance.",
  },
  {
    id: "photo",
    title: "A suspicious snapshot",
    category: "WITNESS EVIDENCE",
    position: [5.2, 1.15, -4.5],
    icon: "▣",
    description:
      "A print from Jordan’s instant camera shows your prototype design. In the background, a green-sleeved volunteer pushes a cart. A familiar square antenna sticks out from under a jacket.",
  },
  {
    id: "badge",
    title: "Repair-room access slip",
    category: "ACCESS RECORD",
    position: [0, 1.1, -7.8],
    icon: "≡",
    description:
      "23:44 — repair room opened.\nBadge V-03: Sam, event volunteer.\nEquipment intake: one small electronic device.",
  },
  {
    id: "heat",
    title: "Battery alert",
    category: "HARDWARE TELEMETRY",
    position: [-5.8, 1.3, 2.2],
    icon: "ϟ",
    description:
      "23:42 — SPARKY / battery temperature critical.\nSafety instruction: disconnect charger and move device to the repair station.\nAlert acknowledged by volunteer V-03.",
  },
];

// Shared by rendered furniture and player collision. x/z are center coordinates.
export const obstacles = [
  { x: -4.5, z: -4.5, width: 3.6, depth: 1.5 },
  { x: 4.5, z: -4.5, width: 3.6, depth: 1.5 },
  { x: -5.8, z: 2.2, width: 1.8, depth: 1.3 },
  { x: 0, z: -7.8, width: 2.5, depth: 1.1 },
];
