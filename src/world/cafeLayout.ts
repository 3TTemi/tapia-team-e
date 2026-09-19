import type { Position } from "../game/types";

// Share the seat anchors between furniture, collision and the opening actor.
export const CAFE_TABLE_ZS = [27, 32] as const;
export const CAFE_CHAIR_XS = [4.22, 5.38] as const;
export const CAFE_CHAIR_OFFSET = 1.12;
export const CAFE_SEAT_ROWS = CAFE_TABLE_ZS.flatMap((z) => [
  z - CAFE_CHAIR_OFFSET,
  z + CAFE_CHAIR_OFFSET,
]);
export const OPENING_SEATED_POSITION: Position = [
  CAFE_CHAIR_XS[0],
  0,
  CAFE_TABLE_ZS[0] + CAFE_CHAIR_OFFSET - 0.065,
];
