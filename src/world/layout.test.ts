import assert from "node:assert/strict";
import test from "node:test";
import { clues, obstacles, suspects } from "../game/case";
import {
  hasClearSight,
  isWorldBlocked,
  PLAYER_SPAWN,
  worldFloors,
} from "./layout";

const blocked = (x: number, z: number) =>
  isWorldBlocked(x, z, obstacles) ||
  suspects.some(
    (suspect) =>
      Math.hypot(x - suspect.position[0], z - suspect.position[2]) < 0.65,
  );

test("the cafe, plaza, and bank floors meet without coplanar surface overlap", () => {
  for (let i = 0; i < worldFloors.length; i++) {
    const a = worldFloors[i];
    for (const b of worldFloors.slice(i + 1)) {
      const overlapX = (a.width + b.width) / 2 - Math.abs(a.x - b.x);
      const overlapZ = (a.depth + b.depth) / 2 - Math.abs(a.z - b.z);
      assert.ok(overlapX <= 0 || overlapZ <= 0, `${a.id} overlaps ${b.id}`);
    }
  }
  const cafe = worldFloors.find((floor) => floor.id === "cafe")!;
  const plaza = worldFloors.find((floor) => floor.id === "plaza")!;
  const bank = worldFloors.find((floor) => floor.id === "bank")!;
  assert.equal(cafe.z - cafe.depth / 2, plaza.z + plaza.depth / 2);
  assert.equal(bank.z + bank.depth / 2, plaza.z - plaza.depth / 2);
});

test("the cafe spawn, both entrances, and the bank lobby form a continuous walking route", () => {
  assert.equal(blocked(PLAYER_SPAWN[0], PLAYER_SPAWN[2]), false);
  for (let z = PLAYER_SPAWN[2]; z >= -6; z -= 0.1) {
    assert.equal(blocked(0, z), false, `Central route obstructed at z=${z}`);
  }
});

test("solid facades and glass stop the player while the open doorways allow entry", () => {
  for (const [x, z] of [
    [4, 9],
    [-4, 9],
    [4, 23],
    [-4, 23],
    [8, 30],
    [12, -2],
    [0, 37],
  ]) {
    assert.equal(blocked(x, z), true, `Missing collision at ${x}, ${z}`);
  }
  assert.equal(hasClearSight(4, 10, 4, 8), false);
  assert.equal(hasClearSight(0, 10, 0, 8), true);
  assert.equal(
    hasClearSight(4, 24, 4, 22),
    true,
    "Cafe glass remains transparent",
  );
});

test("every existing suspect and clue is reachable from the cafe without crossing furniture or walls", () => {
  const queue: [number, number][] = [[PLAYER_SPAWN[0], PLAYER_SPAWN[2]]];
  const visited = new Set([queue[0].join(",")]);
  for (let i = 0; i < queue.length; i++) {
    const [x, z] = queue[i];
    for (const [dx, dz] of [
      [0.5, 0],
      [-0.5, 0],
      [0, 0.5],
      [0, -0.5],
    ]) {
      const next: [number, number] = [x + dx, z + dz];
      const key = next.join(",");
      if (!visited.has(key) && !blocked(...next)) {
        visited.add(key);
        queue.push(next);
      }
    }
  }
  assert.ok(visited.has("0,-13"), "The breached vault must also be enterable");
  for (const target of [...suspects, ...clues]) {
    const [x, , z] = target.position;
    assert.ok(
      queue.some(
        ([px, pz]) =>
          Math.hypot(px - x, pz - z) < 2.4 && hasClearSight(px, pz, x, z),
      ),
      `Cannot approach ${target.id}`,
    );
  }
});
