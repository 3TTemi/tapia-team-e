import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { type PointLight } from "three";
import {
  art,
  Cylinder,
  InstancedBoxes,
  Plant,
  Sign,
  Solid,
} from "./ArtPrimitives";
import type { Position } from "../game/types";

const towers = [
  [-21, 10, 1.5, 11, 20, 13],
  [21, 13, 1.5, 11, 26, 13],
  [-21, 8, 31, 13, 16, 15],
  [21, 9, 31, 13, 18, 15],
  [-37, 21, -8, 12, 42, 17],
  [37, 26, -12, 14, 52, 16],
  [-23, 29, -38, 13, 58, 15],
  [24, 20, -36, 13, 40, 17],
  [-5, 24, -53, 14, 48, 16],
  [11, 32, -63, 11, 64, 14],
  [-47, 15, 29, 13, 30, 18],
  [45, 17, 32, 12, 34, 18],
];

function Skyline() {
  const windows = useMemo(
    () =>
      towers.flatMap(([x, , z, width, height, depth], b) => {
        const cells: { position: Position; size: Position; color: string }[] =
          [];
        for (let row = 2; row < height - 1; row += 2.4) {
          for (let col = -width / 2 + 1; col < width / 2 - 0.7; col += 1.5) {
            const lit = Math.sin((row * 23 + col * 19 + b * 8) * 2.8) > -0.2;
            cells.push({
              position: [x + col, row, z + depth / 2 + 0.04],
              size: [0.8, 1.3, 0.05],
              color: lit ? (b % 3 ? "#8c9e9d" : "#b0a184") : "#203e4a",
            });
          }
        }
        return cells;
      }),
    [],
  );
  return (
    <group name="financial-district-skyline">
      {towers.map(([x, y, z, width, height, depth], i) => (
        <group key={i}>
          <Solid
            position={[x, y, z]}
            size={[width, height, depth]}
            color={i % 2 ? "#1d3443" : "#233944"}
            metal={0.45}
            rough={0.5}
            shadow={false}
          />
          <Solid
            position={[x, height + 0.1, z]}
            size={[width + 0.3, 0.2, depth + 0.3]}
            color="#405563"
            metal={0.65}
            shadow={false}
          />
          {i > 3 && (
            <Solid
              position={[
                x - width / 2 + 0.1,
                height * 0.62,
                z + depth / 2 + 0.08,
              ]}
              size={[0.04, height * 0.65, 0.04]}
              color="#6b9bab"
              glow={0.8}
              shadow={false}
            />
          )}
        </group>
      ))}
      <InstancedBoxes items={windows} glow={0.22} rough={0.24} metal={0.65} />
      <Sign
        position={[-21, 3.2, 8.96]}
        title="M E T R O  /  0 4"
        subtitle="FINANCIAL DISTRICT"
        width={6}
        height={1.1}
      />
      <Sign
        position={[21, 3.2, 8.96]}
        title="N O R T H L I N E"
        subtitle="CITY SERVICES"
        width={6}
        height={1.1}
      />
      <Sign
        position={[-21, 3, 23.05]}
        title="PLAZA MARKET"
        width={6}
        rotation={Math.PI}
      />
      <Sign
        position={[21, 3, 23.05]}
        title="STATION  /  02"
        width={6}
        rotation={Math.PI}
      />
    </group>
  );
}

function PoliceCar() {
  const red = useRef<PointLight>(null),
    blue = useRef<PointLight>(null);
  useFrame(({ clock }) => {
    const pulse = Math.sin(clock.elapsedTime * 3);
    if (red.current) red.current.intensity = 3 + Math.max(0, pulse) * 14;
    if (blue.current) blue.current.intensity = 3 + Math.max(0, -pulse) * 14;
  });
  return (
    <group position={[11.5, 0, 16]}>
      <Solid
        position={[0, 0.62, 0]}
        size={[4.5, 0.72, 2.1]}
        color="#122732"
        metal={0.68}
        rough={0.25}
        round={0.24}
      />
      <Solid
        position={[0, 0.985, 0]}
        size={[4.27, 0.24, 2.06]}
        color="#a7b7b6"
        metal={0.68}
        rough={0.26}
        round={0.105}
      />
      <Solid
        position={[0.07, 1.28, 0]}
        size={[2.36, 0.73, 1.87]}
        color="#1c3d4e"
        metal={0.85}
        rough={0.12}
        round={0.24}
      />
      <Solid
        position={[0.07, 1.65, 0]}
        size={[1.82, 0.085, 1.65]}
        color="#a7b7b6"
        metal={0.7}
        rough={0.22}
        round={0.035}
      />
      <Solid
        position={[0, 1.75, 0]}
        size={[1.5, 0.08, 0.37]}
        color={art.ink}
        round={0.025}
      />
      <Solid
        position={[-0.39, 1.83, 0]}
        size={[0.56, 0.11, 0.31]}
        color="#e76377"
        glow={2.2}
        round={0.04}
      />
      <Solid
        position={[0.39, 1.83, 0]}
        size={[0.56, 0.11, 0.31]}
        color="#79a5f0"
        glow={2.2}
        round={0.04}
      />
      {[-1.46, 1.46].flatMap((x) =>
        [-1.02, 1.02].map((z) => (
          <group key={`${x}-${z}`}>
            <Cylinder
              position={[x, 0.43, z]}
              radius={0.44}
              height={0.25}
              color="#101b22"
              rough={0.9}
              metal={0}
              rotation={[Math.PI / 2, 0, 0]}
            />
            <Cylinder
              position={[x, 0.43, z * 1.13]}
              radius={0.25}
              height={0.025}
              color="#688087"
              metal={0.85}
              rotation={[Math.PI / 2, 0, 0]}
            />
          </group>
        )),
      )}
      {[-0.65, 0.65].map((z) => (
        <Solid
          key={z}
          position={[-2.245, 0.82, z]}
          size={[0.03, 0.12, 0.5]}
          color="#d3e5cd"
          glow={1.4}
          round={0.015}
        />
      ))}
      <Sign
        position={[0, 0.98, 1.042]}
        title="POLICE"
        width={1.4}
        height={0.25}
        background="#a7b7b6"
        color="#193442"
      />
      <pointLight
        ref={red}
        position={[-0.5, 2, 0]}
        color="#eb6173"
        distance={10}
      />
      <pointLight
        ref={blue}
        position={[0.5, 2, 0]}
        color="#6da5f2"
        distance={10}
      />
    </group>
  );
}

export default function PlazaDetails() {
  return (
    <group name="rainy-bank-plaza">
      <Solid
        position={[0, 0.008, 16]}
        size={[53, 0.016, 5.7]}
        color="#23343f"
        rough={0.27}
        metal={0.55}
      />
      {[13.1, 18.9].map((z) => (
        <group key={z}>
          <Solid
            position={[0, 0.035, z]}
            size={[53, 0.07, 0.19]}
            color="#7c8d8e"
            rough={0.48}
          />
          <Solid
            position={[0, 0.075, z]}
            size={[4.6, 0.014, 0.26]}
            color="#788b89"
          />
        </group>
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <Solid
          key={i}
          position={[0, 0.024, 13.5 + i * 0.8]}
          size={[4.2, 0.016, 0.34]}
          color="#c4c9b7"
          rough={0.42}
          shadow={false}
        />
      ))}
      {[-22, -17, -12, -7, 7, 17, 22].map((x) => (
        <Solid
          key={x}
          position={[x, 0.025, 16]}
          size={[2, 0.014, 0.07]}
          color="#9c946b"
          shadow={false}
        />
      ))}
      {[-8, 8, -20, 20].flatMap((x) =>
        [13.35, 18.65].map((z) => (
          <group key={`${x}-${z}`}>
            <Solid
              position={[x, 0.024, z]}
              size={[0.8, 0.025, 0.42]}
              color="#192a33"
              metal={0.9}
              rough={0.37}
            />
            {Array.from({ length: 8 }, (_, i) => (
              <Solid
                key={i}
                position={[x - 0.32 + i * 0.09, 0.043, z]}
                size={[0.025, 0.012, 0.37]}
                color="#586c72"
                metal={0.8}
                shadow={false}
              />
            ))}
          </group>
        )),
      )}
      {[-9, 9, -23, 23].flatMap((x) =>
        [11.5, 21].map((z) => (
          <group key={`${x}-${z}`}>
            <Cylinder
              position={[x, 2.4, z]}
              radius={0.055}
              height={4.8}
              color="#304b59"
              metal={0.7}
            />
            <Solid
              position={[x, 4.71, z]}
              size={[1.1, 0.12, 0.7]}
              color="#31505a"
              metal={0.8}
              round={0.05}
            />
            <Solid
              position={[x, 4.64, z]}
              size={[0.9, 0.02, 0.54]}
              color="#ffd6a1"
              glow={2}
            />
            <Cylinder
              position={[x, 0.09, z]}
              radius={0.16}
              height={0.18}
              color="#3e5761"
              metal={0.65}
            />
          </group>
        )),
      )}
      {[-17, 17].flatMap((x) =>
        [11.4, 21].map((z) => (
          <group key={`${x}-${z}`}>
            <Solid
              position={[x, 0.32, z]}
              size={[5, 0.64, 1.25]}
              color="#526963"
              texture="stone"
              rough={0.7}
              round={0.06}
            />
            <Solid
              position={[x, 0.646, z]}
              size={[4.78, 0.018, 1.04]}
              color="#263d35"
              rough={1}
            />
            <Plant position={[x, 0.48, z]} scale={1.6} />
            {[-1.6, 1.6].map((dx) => (
              <Plant key={dx} position={[x + dx, 0.47, z]} scale={0.75} />
            ))}
          </group>
        )),
      )}
      {[-11.4, 11.4].map((x) => (
        <group key={x}>
          {[20.72, 20.96, 21.2].map((z) => (
            <Solid
              key={z}
              position={[x, 0.47, z]}
              size={[3.3, 0.11, 0.18]}
              color="#987750"
              texture="wood"
              round={0.03}
            />
          ))}
          <Solid
            position={[x, 0.93, 21.3]}
            size={[3.3, 0.52, 0.12]}
            color="#987750"
            texture="wood"
            round={0.04}
          />
          {[-1.1, 1.1].map((dx) => (
            <Solid
              key={dx}
              position={[x + dx, 0.24, 21]}
              size={[0.1, 0.48, 0.8]}
              color="#263f4a"
              metal={0.8}
            />
          ))}
        </group>
      ))}
      {[-6.7, 6.7].map((x) => (
        <group key={x}>
          {[-2.65, 2.65].map((dx) => (
            <group key={dx}>
              <Cylinder
                position={[x + dx, 0.54, 10.8]}
                radius={0.035}
                height={1.08}
                color="#81929a"
                metal={0.8}
              />
              <Solid
                position={[x + dx, 0.06, 10.8]}
                size={[0.5, 0.12, 0.6]}
                color="#2a414c"
                round={0.045}
              />
            </group>
          ))}
          <Solid
            position={[x, 0.89, 10.8]}
            size={[5.8, 0.17, 0.04]}
            color="#bfa559"
            rough={0.8}
          />
          <Sign
            position={[x, 0.89, 10.83]}
            title="POLICE LINE  ·  DO NOT CROSS"
            width={5.4}
            height={0.14}
            color="#23313a"
            background="#bfa559"
          />
        </group>
      ))}
      {[-2.8, 2.8].map((x) => (
        <group key={x}>
          <Cylinder
            position={[x, 0.47, 12]}
            radius={0.105}
            height={0.94}
            color="#536d75"
            metal={0.8}
          />
          <Cylinder
            position={[x, 0.88, 12]}
            radius={0.11}
            height={0.045}
            color="#b5d0ca"
            glow={1.5}
          />
        </group>
      ))}
      <PoliceCar />
      <Skyline />
      <Sign
        position={[-3.6, 1.9, 21.2]}
        title="BANK  ↑"
        subtitle="USE THE MARKED CROSSING"
        width={2.2}
        height={0.65}
        border
      />
      <Cylinder
        position={[-3.6, 0.78, 21.15]}
        radius={0.035}
        height={1.56}
        color={art.steel}
        metal={0.8}
      />
      <pointLight
        position={[-8, 4, 13]}
        color="#99bfd1"
        intensity={32}
        distance={18}
        decay={2}
      />
      <pointLight
        position={[8, 4, 21]}
        color="#e7c093"
        intensity={26}
        distance={16}
        decay={2}
      />
    </group>
  );
}
