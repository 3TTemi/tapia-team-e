import type { Clue, Suspect } from "./types";

// Public world content. Dialogue rules live separately in dialogue.ts.
export const suspects: Suspect[] = [
  {
    id: "alex",
    name: "Milo",
    role: "BANK JANITOR",
    color: "#ae9fff",
    position: [-4.3, 0, -1.6],
    opening:
      "Missing cash? I mop floors, detective. I kept to the lobby. Nobody needs to bother the manager about me.",
  },
  {
    id: "jordan",
    name: "Boone",
    role: "SECURITY GUARD",
    color: "#f2ab72",
    position: [4.3, 0, -1.6],
    opening:
      "I watched the cameras all evening. Nothing unusual. This bank is secure. Was secure.",
  },
  {
    id: "sam",
    name: "Ellis",
    role: "REGULAR CUSTOMER · CONTRACTOR",
    color: "#83d8b1",
    position: [3.4, 0, -6.8],
    opening:
      "Terrible business. I only came to collect my repair invoice. I stayed in the public lobby, but I’m happy to help.",
  },
];

export const clues: Clue[] = [
  {
    id: "dock",
    title: "Empty cash-transfer tray",
    category: "ROBBERY SCENE",
    position: [-3.6, 1.15, -4.5],
    icon: "◇",
    description:
      "18:04 — a courier collected the bank’s sealed cash bag. The tray and locks are intact. The pickup was marked ‘security authorized,’ but the bank ordered no collection tonight.",
  },
  {
    id: "log",
    title: "Security inactivity log",
    category: "SECURITY RECORD",
    position: [-5.3, 1.4, -4.5],
    icon: ">_",
    description:
      "17:55–18:06 — no camera checks or patrol check-ins from Boone.\nThe security terminal stayed signed in and unlocked.\nBoone claims he watched the cameras the whole time.",
  },
  {
    id: "photo",
    title: "Manager’s office photo",
    category: "CAMERA STILL",
    position: [5.2, 1.15, -4.5],
    icon: "▣",
    description:
      "17:59 — the office camera caught Milo putting the manager’s gift bottle into his cleaning cart. He said he never left the lobby. The office door looks onto the staff corridor.",
  },
  {
    id: "badge",
    title: "Staff-corridor access record",
    category: "ACCESS RECORD",
    position: [0, 1.1, -7.8],
    icon: "≡",
    description:
      "18:01 — staff corridor opened with contractor pass E-17: Ellis.\nThe corridor leads to the security desk.\nEllis claimed to have stayed in the public lobby.",
  },
  {
    id: "heat",
    title: "Courier pickup instructions",
    category: "DISPATCH RECORD",
    position: [-5.8, 1.3, 2.2],
    icon: "ϟ",
    description:
      "18:02 — bank security terminal: unscheduled cash pickup.\nBooked under Ellis’s verified contractor account E-17.\nRunner instruction: ‘Collect the sealed cash bag at 18:04. Bring it to me behind the bank.’",
  },
];

// Shared by rendered furniture and player collision. x/z are center coordinates.
export const obstacles = [
  { x: -4.5, z: -4.5, width: 3.6, depth: 1.5 },
  { x: 4.5, z: -4.5, width: 3.6, depth: 1.5 },
  { x: -5.8, z: 2.2, width: 1.8, depth: 1.3 },
  { x: 0, z: -7.8, width: 2.5, depth: 1.1 },
];
