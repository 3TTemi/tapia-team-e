import type { Position } from "../game/types";
import { CAFE_SEAT_ROWS } from "./cafeLayout";

// World coordinates stay separate from the art so another renderer can reuse the
// same entrances, furniture footprints, and investigation positions.
export const PLAYER_SPAWN: Position = [0, 1.7, 33];
export const PLAYER_RADIUS = 0.28;

export type Surface = "stone" | "trim" | "wood" | "cream" | "glass" | "seat";
export interface Footprint {
  x: number;
  z: number;
  width: number;
  depth: number;
}

// Adjacent floor panels share an edge, never an area. Overlapping top faces at
// y=0 caused the visible flicker at the cafe and bank thresholds.
export const worldFloors: (Footprint & { id: "cafe" | "plaza" | "bank" })[] = [
  { id: "cafe", x: 0, z: 30, width: 16, depth: 14 },
  { id: "plaza", x: 0, z: 16, width: 62, depth: 14 },
  { id: "bank", x: 0, z: -3, width: 24, depth: 24 },
];

export interface WorldStructure extends Footprint {
  id: string;
  height: number;
  surface: Surface;
  blocksSight?: boolean;
}

export const worldStructures: WorldStructure[] = [
  ...[-10.6, 10.6].map((x) => ({
    id: `lobby-seat-${x}`,
    x,
    z: -2,
    width: 1.5,
    depth: 3.4,
    height: 0.6,
    surface: "seat" as const,
  })),
  ...[-3.15, 3.15].map((x) => ({
    id: `queue-${x}`,
    x,
    z: 2.25,
    width: 0.15,
    depth: 2.8,
    height: 1.1,
    surface: "trim" as const,
  })),
  ...[-11.4, 11.4].map((x) => ({
    id: `street-bench-${x}`,
    x,
    z: 21,
    width: 3.3,
    depth: 0.85,
    height: 0.9,
    surface: "wood" as const,
  })),
  ...[-2.8, 2.8].map((x) => ({
    id: `bollard-${x}`,
    x,
    z: 12,
    width: 0.23,
    depth: 0.23,
    height: 0.94,
    surface: "trim" as const,
  })),
  ...[-9, 9, -23, 23].flatMap((x) =>
    [11.5, 21].map((z) => ({
      id: `street-lamp-${x}-${z}`,
      x,
      z,
      width: 0.15,
      depth: 0.15,
      height: 4.8,
      surface: "trim" as const,
    })),
  ),
  // The bank faces south (+z). The open middle of the facade is the entrance.
  {
    id: "bank-west",
    x: -12,
    z: -3,
    width: 0.4,
    depth: 24,
    height: 6.8,
    surface: "stone",
    blocksSight: true,
  },
  {
    id: "bank-east",
    x: 12,
    z: -3,
    width: 0.4,
    depth: 24,
    height: 6.8,
    surface: "stone",
    blocksSight: true,
  },
  {
    id: "bank-back",
    x: 0,
    z: -15,
    width: 24.4,
    depth: 0.4,
    height: 6.8,
    surface: "stone",
    blocksSight: true,
  },
  {
    id: "bank-front-left",
    x: -7.3,
    z: 9,
    width: 9.4,
    depth: 0.5,
    height: 6.8,
    surface: "stone",
    blocksSight: true,
  },
  {
    id: "bank-front-right",
    x: 7.3,
    z: 9,
    width: 9.4,
    depth: 0.5,
    height: 6.8,
    surface: "stone",
    blocksSight: true,
  },
  ...[-9, 9].flatMap((x) =>
    [-7, 3].map((z) => ({
      id: `column-${x}-${z}`,
      x,
      z,
      width: 0.65,
      depth: 0.65,
      height: 6.8,
      surface: "cream" as const,
      blocksSight: true,
    })),
  ),
  {
    id: "vault-left",
    x: -7.5,
    z: -11,
    width: 9,
    depth: 0.45,
    height: 5.2,
    surface: "trim",
    blocksSight: true,
  },
  {
    id: "vault-right",
    x: 7.5,
    z: -11,
    width: 9,
    depth: 0.45,
    height: 5.2,
    surface: "trim",
    blocksSight: true,
  },
  {
    id: "vault-open-door",
    x: 3.1,
    z: -12.3,
    width: 0.55,
    depth: 3.3,
    height: 3.9,
    surface: "stone",
    blocksSight: true,
  },
  // Cafe faces the bank. A 4.2m opening gives a clear view across the crossing.
  {
    id: "cafe-west",
    x: -8,
    z: 30,
    width: 0.35,
    depth: 14,
    height: 4.5,
    surface: "cream",
    blocksSight: true,
  },
  {
    id: "cafe-east",
    x: 8,
    z: 30,
    width: 0.35,
    depth: 14,
    height: 4.5,
    surface: "cream",
    blocksSight: true,
  },
  {
    id: "cafe-back",
    x: 0,
    z: 37,
    width: 16.35,
    depth: 0.35,
    height: 4.5,
    surface: "cream",
    blocksSight: true,
  },
  {
    id: "cafe-window-left",
    x: -5.05,
    z: 23,
    width: 5.9,
    depth: 0.14,
    height: 3.8,
    surface: "glass",
  },
  {
    id: "cafe-window-right",
    x: 5.05,
    z: 23,
    width: 5.9,
    depth: 0.14,
    height: 3.8,
    surface: "glass",
  },
  {
    id: "coffee-counter",
    x: -5.5,
    z: 30.2,
    width: 2.5,
    depth: 5.8,
    height: 1.05,
    surface: "wood",
  },
  {
    id: "coffee-backbar",
    x: -6.5,
    z: 35.6,
    width: 2,
    depth: 0.8,
    height: 1.1,
    surface: "wood",
  },
  ...[27, 32].map((z) => ({
    id: `cafe-table-${z}`,
    x: 4.8,
    z,
    width: 2.1,
    depth: 1.5,
    height: 0.85,
    surface: "wood" as const,
  })),
  ...CAFE_SEAT_ROWS.map((z) => ({
    id: `cafe-seat-${z}`,
    x: 4.8,
    z,
    width: 1.98,
    depth: 0.75,
    height: 0.48,
    surface: "seat" as const,
  })),
  {
    id: "cafe-lounge",
    x: 4.7,
    z: 35.6,
    width: 3.3,
    depth: 1,
    height: 0.65,
    surface: "seat",
  },
  {
    id: "cafe-atm",
    x: -6.7,
    z: 24.3,
    width: 1,
    depth: 0.8,
    height: 1.9,
    surface: "trim",
    blocksSight: true,
  },
  ...[-17, 17].flatMap((x) =>
    [11.4, 21].map((z) => ({
      id: `planter-${x}-${z}`,
      x,
      z,
      width: 5,
      depth: 1.25,
      height: 0.65,
      surface: "stone" as const,
    })),
  ),
  // Crime-scene barriers leave the entrance and the pedestrian crossing open.
  ...[-6.7, 6.7].map((x) => ({
    id: `barrier-${x}`,
    x,
    z: 10.8,
    width: 5.8,
    depth: 0.32,
    height: 1.05,
    surface: "trim" as const,
  })),
  {
    id: "police-car",
    x: 11.5,
    z: 16,
    width: 4.5,
    depth: 2.1,
    height: 0.85,
    surface: "trim",
  },
  ...[-26.5, 26.5].map((x) => ({
    id: `street-end-${x}`,
    x,
    z: 16,
    width: 0.35,
    depth: 14,
    height: 1.15,
    surface: "stone" as const,
  })),
  // Building fronts close off the edges of the street with visible geometry.
  ...[-10, 10].map((x) => ({
    id: `cafe-neighbor-${x}`,
    x,
    z: 23.3,
    width: 4,
    depth: 0.4,
    height: 4.5,
    surface: "stone" as const,
    blocksSight: true,
  })),
  ...[-19.5, 19.5].flatMap((x) =>
    [8.7, 23.3].map((z) => ({
      id: `street-wall-${x}-${z}`,
      x,
      z,
      width: 15,
      depth: 0.4,
      height: 9,
      surface: "stone" as const,
      blocksSight: true,
    })),
  ),
];

const walkableAreas: Footprint[] = [
  { x: 0, z: -2.8, width: 24, depth: 24.4 },
  { x: 0, z: 16, width: 53, depth: 14.8 },
  { x: 0, z: 29.8, width: 16, depth: 14.4 },
];

function within(x: number, z: number, box: Footprint, padding = 0) {
  return (
    Math.abs(x - box.x) < box.width / 2 + padding &&
    Math.abs(z - box.z) < box.depth / 2 + padding
  );
}

export function isWorldBlocked(
  x: number,
  z: number,
  furniture: readonly Footprint[] = [],
) {
  return (
    !walkableAreas.some((area) => within(x, z, area)) ||
    worldStructures.some((box) => within(x, z, box, PLAYER_RADIUS)) ||
    furniture.some((box) => within(x, z, box, PLAYER_RADIUS))
  );
}

// Segment/rectangle intersection prevents interacting with evidence through a
// wall without adding physics or changing the case's targeting rules.
export function hasClearSight(
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number,
) {
  return !worldStructures.some((box) => {
    if (!box.blocksSight) return false;
    let near = 0;
    let far = 1;
    for (const [origin, delta, center, half] of [
      [fromX, toX - fromX, box.x, box.width / 2],
      [fromZ, toZ - fromZ, box.z, box.depth / 2],
    ]) {
      if (Math.abs(delta) < 1e-8) {
        if (origin < center - half || origin > center + half) return false;
      } else {
        const a = (center - half - origin) / delta;
        const b = (center + half - origin) / delta;
        near = Math.max(near, Math.min(a, b));
        far = Math.min(far, Math.max(a, b));
        if (near > far) return false;
      }
    }
    return true;
  });
}
