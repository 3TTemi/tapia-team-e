import { useTexture } from "@react-three/drei";
import { CoffeeCup, Cylinder, Solid } from "./ArtPrimitives";
import StylizedCharacter from "./StylizedCharacter";
import { ambientActors } from "./layout";
import type { Position } from "../game/types";

const LOGO_ASPECT = 418 / 150;

export function BrandedCoffeeCup({
  position,
  ceramic = false,
}: {
  position: Position;
  ceramic?: boolean;
}) {
  const logo = useTexture("/brand/capital-one.svg");
  const radius = ceramic ? 0.08 : 0.083;
  const arc = 1.35;
  return (
    <group position={position}>
      <CoffeeCup position={[0, 0, 0]} ceramic={ceramic} />
      {/* The print follows the cup, with its original SVG aspect along the arc. */}
      <mesh position={[0, 0.105, 0]}>
        <cylinderGeometry
          args={[
            radius,
            radius,
            (radius * arc) / LOGO_ASPECT,
            16,
            1,
            true,
            -arc / 2,
            arc,
          ]}
        />
        <meshBasicMaterial map={logo} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

function CafePlaque({
  position,
  width,
  rotation = 0,
}: {
  position: Position;
  width: number;
  rotation?: number;
}) {
  const logo = useTexture("/brand/capital-one.svg");
  const height = width / LOGO_ASPECT;
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Solid
        position={[0, 0, 0]}
        size={[width + 0.16, height + 0.13, 0.035]}
        color="#d1d3c4"
        rough={0.55}
        round={0.012}
        shadow={false}
      />
      <mesh position={[0, 0, 0.019]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={logo} transparent />
      </mesh>
    </group>
  );
}

function Uniform({ police }: { police: boolean }) {
  return (
    <>
      <Solid
        position={[0, 1.06, 0.225]}
        size={[0.44, 0.49, 0.038]}
        round={0.015}
        color={police ? "#172c3b" : "#20505a"}
        rough={0.9}
      />
      <Solid
        position={[0, 0.76, 0.235]}
        size={[0.52, 0.11, 0.04]}
        color={police ? "#152936" : "#20505a"}
        round={0.015}
      />
      {police ? (
        <>
          <mesh position={[0.12, 1.22, 0.255]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.046, 0.046, 0.012, 6]} />
            <meshStandardMaterial
              color="#c2b586"
              metalness={0.65}
              roughness={0.4}
            />
          </mesh>
          <Solid
            position={[-0.16, 1.2, 0.27]}
            size={[0.085, 0.14, 0.045]}
            color="#15232b"
            round={0.012}
          />
          <Solid
            position={[-0.16, 1.33, 0.27]}
            size={[0.012, 0.13, 0.012]}
            color="#475b65"
          />
          <Cylinder
            position={[0, 1.99, 0]}
            radius={0.285}
            height={0.11}
            color="#1c3344"
          />
          <Solid
            position={[0, 1.96, 0.25]}
            size={[0.37, 0.035, 0.25]}
            round={0.017}
            color="#243a48"
          />
        </>
      ) : (
        <>
          <Solid
            position={[0, 0.92, 0.253]}
            size={[0.25, 0.16, 0.018]}
            color="#2c6570"
            rough={0.95}
            round={0.008}
          />
          <CafePlaque position={[0, 1.19, 0.261]} width={0.19} />
        </>
      )}
    </>
  );
}

export default function AmbientLife() {
  return (
    <group name="cafe-staff-and-police">
      <CafePlaque
        position={[-4.17, 0.7, 31.1]}
        width={1.15}
        rotation={Math.PI / 2}
      />
      <CafePlaque position={[-3.2, 2.7, 36.77]} width={2} rotation={Math.PI} />
      <CafePlaque
        position={[-7.68, 3.88, 30.2]}
        width={1.45}
        rotation={Math.PI / 2}
      />
      <group
        position={[-4.8, 1.153, 32.4]}
        rotation={[0, Math.PI / 2, 0]}
        scale={1.25}
      >
        <BrandedCoffeeCup position={[0, 0, 0]} />
        <BrandedCoffeeCup position={[0.24, 0, 0.04]} />
      </group>
      {ambientActors.map((actor) => (
        <group
          key={actor.id}
          position={actor.position}
          rotation={[0, actor.yaw, 0]}
        >
          <StylizedCharacter
            position={[0, 0, 0]}
            name={actor.id}
            color={actor.role === "police" ? "#294657" : "#d5c8ae"}
          >
            <Uniform police={actor.role === "police"} />
          </StylizedCharacter>
        </group>
      ))}
    </group>
  );
}
