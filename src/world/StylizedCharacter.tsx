import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { Position } from "../game/types";
import { Solid } from "./ArtPrimitives";

function Limb({
  position,
  length,
  radius,
  color,
  rotation = [0, 0, 0],
}: {
  position: Position;
  length: number;
  radius: number;
  color: string;
  rotation?: Position;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <capsuleGeometry args={[radius, length, 4, 10]} />
      <meshStandardMaterial color={color} roughness={0.88} />
    </mesh>
  );
}

export default function StylizedCharacter({
  position,
  color,
  name,
  children,
}: {
  position: Position;
  color: string;
  name: string;
  children: React.ReactNode;
}) {
  const body = useRef<Group>(null),
    head = useRef<Group>(null);
  const skin =
    name === "Alex" ? "#946544" : name === "Jordan" ? "#c3946f" : "#c2a07a";
  useFrame(({ clock }) => {
    if (body.current)
      body.current.position.y =
        Math.sin(clock.elapsedTime * 1.5 + position[0]) * 0.012;
    if (head.current)
      head.current.rotation.y =
        Math.sin(clock.elapsedTime * 0.45 + position[0]) * 0.065;
  });
  return (
    <group position={position}>
      <group ref={body}>
        {[-0.17, 0.17].map((x) => (
          <group key={x}>
            <Limb
              position={[x, 0.5, 0]}
              length={0.57}
              radius={0.13}
              color="#243948"
            />
            <Solid
              position={[x, 0.1, 0.1]}
              size={[0.27, 0.17, 0.47]}
              round={0.075}
              color="#34464d"
              rough={0.75}
            />
            <Solid
              position={[x, 0.045, 0.1]}
              size={[0.28, 0.04, 0.46]}
              round={0.018}
              color="#aeb5a8"
            />
          </group>
        ))}
        <Solid
          position={[0, 1.08, 0]}
          size={[0.65, 0.68, 0.39]}
          round={0.14}
          color={color}
          rough={0.92}
        />
        <Solid
          position={[0, 1.33, 0.205]}
          size={[0.25, 0.14, 0.03]}
          round={0.013}
          color="#c8c7b1"
        />
        <Solid
          position={[0, 1.04, 0.205]}
          size={[0.017, 0.51, 0.018]}
          color="#5a7379"
        />
        <Solid
          position={[0.17, 1.14, 0.213]}
          size={[0.1, 0.14, 0.016]}
          round={0.01}
          color="#d9d5bd"
        />
        <Limb
          position={[-0.42, 1.03, 0]}
          length={0.4}
          radius={0.115}
          color={color}
          rotation={[0.12, 0, -0.12]}
        />
        <Limb
          position={[0.42, 1.03, 0]}
          length={0.4}
          radius={0.115}
          color={color}
          rotation={[-0.07, 0, 0.12]}
        />
        <Limb
          position={[-0.45, 0.69, 0.03]}
          length={0.09}
          radius={0.09}
          color={skin}
        />
        <Limb
          position={[0.45, 0.69, 0.03]}
          length={0.09}
          radius={0.09}
          color={skin}
        />
        <Limb position={[0, 1.46, 0]} length={0.08} radius={0.1} color={skin} />
        <group ref={head} position={[0, 1.73, 0]}>
          <mesh scale={[0.275, 0.32, 0.255]} castShadow>
            <sphereGeometry args={[1, 20, 16]} />
            <meshStandardMaterial color={skin} roughness={0.75} />
          </mesh>
          <mesh
            position={[0, 0.17, -0.035]}
            scale={[0.285, 0.17, 0.254]}
            castShadow
          >
            <sphereGeometry args={[1, 18, 12]} />
            <meshStandardMaterial color="#2b3030" roughness={0.9} />
          </mesh>
          {[-0.095, 0.095].map((x) => (
            <group key={x}>
              <mesh position={[x, 0.025, 0.241]} scale={[0.027, 0.035, 0.013]}>
                <sphereGeometry args={[1, 8, 6]} />
                <meshStandardMaterial color="#172731" />
              </mesh>
              <Solid
                position={[x, 0.09, 0.233]}
                size={[0.07, 0.025, 0.019]}
                round={0.009}
                color="#3a352e"
              />
            </group>
          ))}
          <mesh position={[0, -0.04, 0.264]} scale={[0.044, 0.055, 0.048]}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial color={skin} />
          </mesh>
          <Solid
            position={[0, -0.14, 0.236]}
            size={[0.09, 0.016, 0.017]}
            round={0.007}
            color="#71513f"
          />
        </group>
      </group>
      {children}
    </group>
  );
}
