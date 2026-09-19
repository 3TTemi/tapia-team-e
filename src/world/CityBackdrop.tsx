import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, Object3D, type InstancedMesh } from "three";
import { InstancedBoxes } from "./ArtPrimitives";
import type { Position } from "../game/types";

// All footprints are outside the playable block. The existing close towers in
// PlazaDetails still frame the bank; these layers fill the streets beyond them.
const buildings = [
  [-8, 49, 12, 18, 13],
  [8, 51, 13, 24, 14],
  [-25, 54, 13, 30, 14],
  [26, 55, 14, 27, 14],
  [-42, 6.5, 10, 25, 11],
  [42, 5, 10, 21, 11],
  [-57, -8, 14, 36, 15],
  [58, -8, 14, 33, 15],
  [-64, 33, 12, 28, 14],
  [62, 33, 12, 32, 14],
  [-76, 14, 13, 35, 19],
  [77, 14, 13, 30, 19],
  [-49, -39, 14, 47, 14],
  [49, -41, 13, 44, 15],
  [-68, -33, 12, 39, 16],
  [68, -35, 14, 49, 15],
  [-38, 59, 10, 39, 13],
  [42, 57, 12, 42, 12],
  [-12, 72, 12, 37, 13],
  [14, 75, 13, 45, 13],
  [-40, -68, 13, 56, 15],
  [35, -67, 12, 54, 14],
  [-20, -83, 12, 62, 14],
  [2, -86, 13, 59, 13],
  [20, -87, 11, 69, 13],
  [-62, 60, 15, 43, 15],
  [62, 60, 14, 46, 15],
  [-64, -64, 14, 53, 15],
  [65, -64, 12, 58, 15],
] as const;

type Box = { position: Position; size: Position; color: string };
type Window = Box & { yaw: number };

function WindowBatch({ items }: { items: Window[] }) {
  const mesh = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    const transform = new Object3D();
    const color = new Color();
    items.forEach((item, index) => {
      transform.position.set(...item.position);
      transform.rotation.y = item.yaw;
      transform.scale.set(item.size[0], item.size[1], 1);
      transform.updateMatrix();
      mesh.current!.setMatrixAt(index, transform.matrix);
      mesh.current!.setColorAt(index, color.set(item.color));
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor)
      mesh.current.instanceColor.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [items]);
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, items.length]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color="white" />
    </instancedMesh>
  );
}

function createDistrict() {
  const masonry: Box[] = [],
    details: Box[] = [],
    windows: Window[] = [];
  const add = (
    items: Box[],
    position: Position,
    size: Position,
    color: string,
  ) => items.push({ position, size, color });
  buildings.forEach(([x, z, width, height, depth], index) => {
    const color = ["#243b47", "#2d4149", "#35494c", "#233945"][index % 4];
    const podium = 3.6 + (index % 3) * 0.7;
    const shoulder = height * (index % 2 ? 0.7 : 0.82);
    // Narrow crowns and offset penthouses break up the rectangular silhouettes.
    add(masonry, [x, shoulder / 2, z], [width, shoulder, depth], color);
    add(
      masonry,
      [x, (height + shoulder) / 2, z],
      [width * 0.76, height - shoulder, depth * 0.77],
      color,
    );
    add(
      masonry,
      [x, podium / 2, z],
      [width + 0.5, podium, depth + 0.5],
      "#344750",
    );
    add(
      details,
      [x, podium + 0.1, z],
      [width + 0.65, 0.2, depth + 0.65],
      "#607077",
    );
    add(
      details,
      [x, shoulder + 0.12, z],
      [width + 0.2, 0.24, depth + 0.2],
      "#4a606b",
    );
    add(
      details,
      [x, height + 0.1, z],
      [width * 0.8, 0.2, depth * 0.81],
      "#586b72",
    );
    add(
      masonry,
      [x - width * 0.15, height + 0.9, z],
      [width * 0.32, 1.6, depth * 0.28],
      "#334a54",
    );
    if (index % 3 === 0) {
      add(
        details,
        [x - width * 0.15, height + 3.6, z],
        [0.12, 4, 0.12],
        "#66818b",
      );
      add(
        details,
        [x + width * 0.12, height + 1.4, z + depth * 0.15],
        [1.7, 1.2, 1.5],
        "#465c64",
      );
    }
    // Vertical masonry fins and a few service vents provide detail without
    // hundreds of scene objects, extra shadow passes, or new light sources.
    for (const side of [-1, 1]) {
      for (const offset of [-0.34, 0.34]) {
        add(
          details,
          [x + width * offset, shoulder / 2, z + side * (depth / 2 + 0.05)],
          [0.12, shoulder, 0.12],
          "#405763",
        );
      }
    }
    for (let vent = 0; vent < 3; vent++) {
      add(
        details,
        [x + width * 0.25, height + 0.35 + vent * 0.16, z],
        [1.5, 0.08, 1.4],
        "#263d46",
      );
    }
    for (let level = 0, y = podium + 1.5; y < height - 0.9; y += 2.5, level++) {
      if (Math.abs(y - shoulder) < 0.85) continue;
      const upper = y > shoulder;
      const w = width * (upper ? 0.76 : 1),
        d = depth * (upper ? 0.77 : 1);
      for (let face = 0; face < 4; face++) {
        const front = face < 2,
          direction = face % 2 === 0 ? 1 : -1;
        const span = front ? w : d;
        for (
          let column = 0, offset = -span / 2 + 1.1;
          offset < span / 2 - 0.6;
          offset += 1.65, column++
        ) {
          const noise = Math.sin(
            index * 127 + level * 37 + column * 19 + face * 43,
          );
          const lit = noise > 0.25 && (level + index) % 6 !== 0;
          const tint = lit
            ? (index + level) % 3 === 0
              ? "#a59470"
              : "#698892"
            : "#1b3541";
          windows.push({
            position: front
              ? [x + offset, y, z + direction * (d / 2 + 0.025)]
              : [x + direction * (w / 2 + 0.025), y, z + offset],
            size: [index % 3 === 0 ? 1.08 : 0.8, 1.35, 1],
            yaw: front
              ? direction > 0
                ? 0
                : Math.PI
              : (direction * Math.PI) / 2,
            color: tint,
          });
        }
      }
    }
  });
  // Extend the street visually past the invisible walking bounds. Separate
  // panels start beyond x=31, so playable pavement never overlaps these faces.
  for (const side of [-1, 1]) {
    add(masonry, [side * 55, -0.055, 16], [48, 0.08, 5.7], "#263b46");
    for (const z of [12.9, 19.1])
      add(details, [side * 55, 0.025, z], [48, 0.05, 0.18], "#526773");
  }
  return { masonry, details, windows };
}

export default function CityBackdrop() {
  const district = useMemo(createDistrict, []);
  return (
    <group name="extended-city-backdrop">
      <InstancedBoxes items={district.masonry} rough={0.78} metal={0.22} />
      <InstancedBoxes items={district.details} rough={0.55} metal={0.4} />
      <WindowBatch items={district.windows} />
    </group>
  );
}
