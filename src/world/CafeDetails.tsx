import {
  art,
  BrandPanel,
  CoffeeCup,
  Cylinder,
  Plant,
  Sign,
  Solid,
} from "./ArtPrimitives";
import type { Position } from "../game/types";
import { CAFE_CHAIR_OFFSET, CAFE_CHAIR_XS, CAFE_TABLE_ZS } from "./cafeLayout";

function Pendant({ position }: { position: Position }) {
  return (
    <group position={position}>
      <Cylinder
        position={[0, 0.65, 0]}
        radius={0.018}
        height={1.3}
        color={art.ink}
      />
      <Cylinder
        position={[0, 0, 0]}
        radius={0.4}
        topRadius={0.12}
        height={0.35}
        color={art.brass}
        metal={0.75}
        rough={0.28}
      />
      <Cylinder
        position={[0, -0.18, 0]}
        radius={0.35}
        height={0.016}
        color="#ffda9a"
        glow={2.5}
      />
    </group>
  );
}

function Chair({
  position,
  rotation = 0,
}: {
  position: Position;
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Solid
        position={[0, 0.5, 0]}
        size={[0.74, 0.2, 0.67]}
        round={0.09}
        color={art.teal}
        rough={0.95}
      />
      <Solid
        position={[0, 0.88, -0.24]}
        size={[0.75, 0.68, 0.2]}
        round={0.095}
        rotation={[-0.08, 0, 0]}
        color={art.teal}
        rough={0.95}
      />
      {[-0.26, 0.26].flatMap((x) =>
        [-0.21, 0.21].map((z) => (
          <Cylinder
            key={`${x}-${z}`}
            position={[x, 0.22, z]}
            radius={0.027}
            height={0.44}
            color={art.brass}
          />
        )),
      )}
      {[-0.35, 0.35].map((x) => (
        <Solid
          key={x}
          position={[x, 0.68, 0]}
          size={[0.075, 0.13, 0.55]}
          round={0.035}
          color={art.teal}
        />
      ))}
    </group>
  );
}

function EspressoMachine() {
  return (
    <group position={[-5.5, 1.15, 30.9]} rotation={[0, Math.PI / 2, 0]}>
      <Solid
        position={[0, 0.33, 0]}
        size={[1.5, 0.64, 0.63]}
        color="#a3b8ba"
        metal={0.93}
        rough={0.22}
        round={0.07}
      />
      <Solid
        position={[0, 0.31, 0.33]}
        size={[1.33, 0.43, 0.035]}
        color="#172931"
        metal={0.3}
        round={0.018}
      />
      <Solid
        position={[0, 0.04, 0.43]}
        size={[1.45, 0.06, 0.5]}
        color="#738a91"
        metal={0.95}
        rough={0.18}
        round={0.025}
      />
      {Array.from({ length: 12 }, (_, i) => (
        <Solid
          key={i}
          position={[-0.6 + i * 0.11, 0.076, 0.44]}
          size={[0.028, 0.008, 0.37]}
          color={art.ink}
          shadow={false}
        />
      ))}
      {[-0.38, 0.38].map((x) => (
        <group key={x}>
          <Cylinder
            position={[x, 0.48, 0.36]}
            radius={0.09}
            height={0.018}
            color={art.cream}
            rotation={[Math.PI / 2, 0, 0]}
          />
          <Solid
            position={[x + 0.012, 0.49, 0.377]}
            size={[0.011, 0.1, 0.009]}
            color={art.ink}
            rotation={[0, 0, -0.6]}
          />
          <Cylinder
            position={[x, 0.25, 0.44]}
            radius={0.11}
            height={0.12}
            color="#a5babc"
            metal={0.95}
          />
          <Solid
            position={[x + 0.15, 0.25, 0.47]}
            size={[0.22, 0.065, 0.065]}
            round={0.025}
            color={art.ink}
          />
          <CoffeeCup position={[x, 0.08, 0.45]} ceramic />
        </group>
      ))}
      <Cylinder
        position={[0.8, 0.19, 0.39]}
        radius={0.023}
        height={0.38}
        color="#b4c8c9"
        metal={1}
        rotation={[0, 0, -0.28]}
      />
      <Cylinder
        position={[1.08, 0.24, 0.04]}
        radius={0.18}
        height={0.42}
        color={art.ink}
      />
      <Cylinder
        position={[1.08, 0.59, 0.04]}
        radius={0.16}
        topRadius={0.2}
        height={0.28}
        color="#6d6557"
        metal={0.1}
      />
      <Cylinder
        position={[1.08, 0.745, 0.04]}
        radius={0.21}
        height={0.04}
        color={art.ink}
      />
      <CoffeeCup position={[-0.45, 0.66, -0.08]} ceramic />
      <CoffeeCup position={[-0.17, 0.66, -0.08]} ceramic />
    </group>
  );
}

function Laptop({ position }: { position: Position }) {
  return (
    <group position={position}>
      <Solid
        position={[0, 0.015, 0]}
        size={[0.7, 0.04, 0.48]}
        color="#7c9298"
        metal={0.8}
        round={0.017}
      />
      <Cylinder
        position={[0, 0.035, -0.2]}
        radius={0.025}
        height={0.66}
        color="#526773"
        rotation={[0, 0, Math.PI / 2]}
      />
      <group position={[0, 0.045, -0.2]} rotation={[-0.12, 0, 0]}>
        <Solid
          position={[0, 0.225, 0]}
          size={[0.7, 0.46, 0.035]}
          color="#364952"
          metal={0.8}
          round={0.016}
        />
        <Sign
          position={[0, 0.235, 0.021]}
          title="GOOD EVENING"
          subtitle="TAKE A MOMENT. FIND YOUR FOCUS."
          width={0.61}
          height={0.34}
          color="#a4c9c3"
        />
      </group>
      {[0, 1, 2].map((i) => (
        <Solid
          key={i}
          position={[0, 0.04, -0.04 + i * 0.055]}
          size={[0.56, 0.004, 0.025]}
          color="#344b52"
          shadow={false}
        />
      ))}
      <Solid
        position={[0, 0.041, 0.15]}
        size={[0.2, 0.003, 0.1]}
        color="#9aadb0"
        shadow={false}
      />
    </group>
  );
}

export default function CafeDetails() {
  return (
    <group name="warm-futuristic-cafe">
      <Solid
        position={[0, 4.5, 30]}
        size={[16.5, 0.22, 14.5]}
        color="#253637"
      />
      {[25, 29, 33, 36].map((z) => (
        <group key={z}>
          <Solid
            position={[0, 4.25, z]}
            size={[16, 0.3, 0.2]}
            color="#79563b"
            texture="wood"
          />
          <Solid
            position={[0, 4.055, z]}
            size={[10, 0.045, 0.05]}
            color="#ffda99"
            glow={1.5}
          />
        </group>
      ))}
      <Solid
        position={[0, 4.04, 23]}
        size={[16.5, 0.72, 0.55]}
        color="#1d3c45"
      />
      {[-7.9, -2.13, 2.13, 7.9].map((x) => (
        <Solid
          key={x}
          position={[x, 1.9, 23]}
          size={[0.1, 3.8, 0.23]}
          color={art.brass}
          metal={0.8}
        />
      ))}
      <BrandPanel position={[-5, 3.13, 23.19]} width={3.5} />
      <Sign
        position={[5.05, 3, 23.13]}
        title="A LITTLE SPACE TO THINK."
        subtitle="CAPITAL ONE CAFÉ  /  OPEN LATE"
        width={4.9}
        height={0.88}
        background="#203d40"
        color="#e1d3b7"
      />
      <Sign
        position={[0, 3.47, 23.27]}
        title="BANK PLAZA  ↑"
        width={3.3}
        height={0.42}
        background="#163237"
      />
      <BrandPanel position={[0, 4.12, 22.65]} width={2.4} rotation={Math.PI} />
      <Solid
        position={[0, 0.015, 25]}
        size={[3.6, 0.03, 2.4]}
        color="#365c5b"
        round={0.01}
      />
      <Solid
        position={[-5.5, 0.52, 30.2]}
        size={[2.5, 1.04, 5.8]}
        round={0.12}
        color="#714c32"
        texture="wood"
      />
      <Solid
        position={[-5.5, 1.095, 30.2]}
        size={[2.67, 0.11, 5.98]}
        round={0.045}
        color="#c4c0af"
        texture="stone"
        rough={0.24}
      />
      {Array.from({ length: 29 }, (_, i) => (
        <Solid
          key={i}
          position={[-4.232, 0.51, 27.48 + i * 0.194]}
          size={[0.036, 0.87, 0.07]}
          color="#ba8b56"
          round={0.012}
        />
      ))}
      <Solid
        position={[-4.245, 0.08, 30.2]}
        size={[0.035, 0.045, 5.45]}
        color="#ffca81"
        glow={1.2}
      />
      <EspressoMachine />
      <Solid
        position={[-5.6, 1.21, 28.2]}
        size={[1.5, 0.1, 1.25]}
        color={art.brass}
        metal={0.65}
        round={0.03}
      />
      <mesh position={[-5.6, 1.55, 28.2]}>
        <boxGeometry args={[1.52, 0.58, 1.26]} />
        <meshPhysicalMaterial
          color="#c3e2df"
          transparent
          opacity={0.16}
          roughness={0.08}
          metalness={0.15}
          depthWrite={false}
        />
      </mesh>
      {[-5.98, -5.62, -5.26].flatMap((x) =>
        [27.97, 28.45].map((z) => (
          <mesh
            key={`${x}-${z}`}
            position={[x, 1.33, z]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[1, 0.7, 0.8]}
            castShadow
          >
            <torusGeometry args={[0.115, 0.065, 8, 12, Math.PI * 1.4]} />
            <meshStandardMaterial color="#b98243" roughness={0.83} />
          </mesh>
        )),
      )}
      <Sign
        position={[-4.18, 0.72, 28.4]}
        title="FRESHLY BAKED"
        subtitle="SOMETHING GOOD, EVERY DAY"
        width={1.6}
        height={0.4}
        rotation={Math.PI / 2}
        color="#e9d5ae"
        background="#6c4932"
      />
      <Solid
        position={[-6.5, 0.55, 35.6]}
        size={[2, 1.1, 0.8]}
        color="#765539"
        texture="wood"
        round={0.07}
      />
      {[1.85, 2.6].map((y) => (
        <group key={y}>
          <Solid
            position={[-6.5, y, 36.5]}
            size={[2.4, 0.065, 0.65]}
            color={art.brass}
          />
          {[-7.3, -6.9, -6.5, -6.1].map((x) => (
            <CoffeeCup key={x} position={[x, y + 0.045, 36.45]} ceramic />
          ))}
        </group>
      ))}
      <Solid
        position={[-7.79, 2.05, 30]}
        size={[0.06, 3.9, 9.8]}
        color="#76573d"
        texture="wood"
      />
      <Sign
        position={[-7.72, 2.92, 30.2]}
        title="THE DAILY RITUAL"
        subtitle="ESPRESSO  /  COLD BREW  /  MATCHA"
        width={4.7}
        height={1.1}
        rotation={Math.PI / 2}
        background="#182e2d"
        border
      />
      {CAFE_TABLE_ZS.map((z) => (
        <group key={z}>
          <Cylinder
            position={[4.8, 0.4, z]}
            radius={0.075}
            height={0.8}
            color={art.brass}
            metal={0.8}
          />
          <Cylinder
            position={[4.8, 0.055, z]}
            radius={0.55}
            height={0.1}
            color="#32474b"
            metal={0.7}
          />
          <Solid
            position={[4.8, 0.86, z]}
            size={[2.1, 0.12, 1.5]}
            round={0.045}
            texture="stone"
            color="#bfc6bc"
            rough={0.27}
          />
          <Laptop position={[4.6, 0.925, z + 0.3]} />
          <CoffeeCup position={[5.28, 0.92, z + 0.3]} ceramic />
          {CAFE_CHAIR_XS.flatMap((x) =>
            [-1, 1].map((side) => (
              <Chair
                key={`${x}-${side}`}
                position={[x, 0, z + side * CAFE_CHAIR_OFFSET]}
                rotation={side > 0 ? Math.PI : 0}
              />
            )),
          )}
          <Pendant position={[4.8, 3, z]} />
        </group>
      ))}
      <Solid
        position={[4.7, 0.39, 35.6]}
        size={[3.3, 0.55, 1]}
        round={0.18}
        color="#687769"
        rough={0.95}
      />
      <Solid
        position={[4.7, 0.95, 35.92]}
        size={[3.3, 0.76, 0.26]}
        round={0.12}
        color="#687769"
        rough={0.95}
      />
      {[-1, 0, 1].map((x) => (
        <Solid
          key={x}
          position={[4.7 + x, 0.72, 35.52]}
          size={[0.92, 0.17, 0.7]}
          round={0.08}
          color="#81917d"
          rough={1}
        />
      ))}
      <Solid
        position={[-6.7, 0.95, 24.3]}
        size={[1, 1.9, 0.8]}
        round={0.12}
        color="#253e4b"
        metal={0.65}
      />
      <Sign
        position={[-6.7, 1.4, 24.71]}
        title="WELCOME"
        subtitle="TAP TO BEGIN"
        width={0.7}
        height={0.52}
        background="#193b45"
        color="#a8e3d6"
      />
      <Solid
        position={[-6.7, 0.88, 24.725]}
        size={[0.46, 0.045, 0.022]}
        color={art.ink}
      />
      <Solid
        position={[-6.7, 0.865, 24.74]}
        size={[0.36, 0.018, 0.022]}
        color="#89c8b9"
        glow={1}
      />
      <Plant position={[7, 0, 35.9]} />
      <Plant position={[-7, 0, 26.2]} scale={0.88} />
      <Pendant position={[-5.2, 3, 28.3]} />
      <Pendant position={[-5.2, 3, 32]} />
      <pointLight
        position={[-4.8, 3.1, 29.8]}
        color="#ffb86d"
        intensity={48}
        distance={13}
        decay={2}
      />
      <pointLight
        position={[4.8, 3, 29.5]}
        color="#ffd3a2"
        intensity={38}
        distance={13}
        decay={2}
      />
      <pointLight
        position={[0, 3.1, 35]}
        color="#ffdba5"
        intensity={22}
        distance={10}
        decay={2}
      />
    </group>
  );
}
