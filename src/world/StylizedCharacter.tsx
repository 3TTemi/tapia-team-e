import { useRef, type RefObject } from "react";
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
  pose = "standing",
  animationTime,
  speaking = false,
  facing = false,
}: {
  position: Position;
  color: string;
  name: string;
  children?: React.ReactNode;
  pose?: "standing" | "seated" | "walking" | "running";
  animationTime?: RefObject<number>;
  speaking?: boolean;
  facing?: boolean;
}) {
  const root = useRef<Group>(null);
  const body = useRef<Group>(null);
  const head = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  const mouth = useRef<Group>(null);
  const legs = useRef<(Group | null)[]>([]);
  const skin =
    name === "Milo" ? "#946544" : name === "Boone" ? "#c3946f" : "#c2a07a";
  useFrame(({ camera, clock }) => {
    const time = animationTime?.current ?? clock.elapsedTime;
    const t = time + position[0];
    if (root.current) {
      const dx = camera.position.x - position[0];
      const dz = camera.position.z - position[2];
      const targetYaw = facing ? Math.atan2(dx, dz) : 0;
      let diff = targetYaw - root.current.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      root.current.rotation.y += diff * 0.12;
    }
    if (body.current) {
      if (pose === "seated") body.current.position.y = -0.18;
      else if (pose === "running")
        body.current.position.y = Math.abs(Math.sin(time * 14)) * 0.055;
      else if (speaking) body.current.position.y = Math.sin(t * 7) * 0.03;
      else body.current.position.y = Math.sin(t * 1.5) * 0.012;
    }
    if (pose === "running" || pose === "walking")
      legs.current.forEach((leg, i) => {
        if (leg)
          leg.rotation.x =
            Math.sin(time * (pose === "running" ? 14 : 7) + i * Math.PI) *
            (pose === "running" ? 0.65 : 0.3);
      });
    if (head.current) {
      if (speaking) {
        head.current.rotation.x = Math.sin(t * 9) * 0.08;
        head.current.rotation.y = Math.sin(t * 3.2) * 0.14;
      } else if (pose === "standing")
        head.current.rotation.y = Math.sin(t * 0.45) * 0.065;
      else {
        head.current.rotation.x = 0;
        head.current.rotation.y = 0;
      }
    }
    if (leftArm.current) {
      leftArm.current.rotation.x = speaking
        ? 0.08 + Math.sin(t * 2.4) * 0.1
        : 0.12;
      leftArm.current.rotation.z = speaking ? -0.22 : -0.12;
    }
    if (rightArm.current) {
      rightArm.current.rotation.x = speaking
        ? -0.55 + Math.sin(t * 8.5) * 0.42
        : -0.07;
      rightArm.current.rotation.z = speaking ? 0.72 : 0.12;
    }
    if (mouth.current)
      mouth.current.scale.y = speaking
        ? 1.2 + Math.abs(Math.sin(t * 14)) * 3.4
        : 1;
  });
  return (
    <group ref={root} position={position}>
      <group ref={body} position={[0, pose === "seated" ? -0.18 : 0, 0]}>
        {[-0.17, 0.17].map((x, i) => (
          <group
            key={x}
            ref={(node) => {
              legs.current[i] = node;
            }}
            position={[0, pose === "seated" ? 0.96 : 0.78, 0]}
          >
            {pose === "seated" ? (
              <>
                <Limb
                  position={[x, -0.085, 0.25]}
                  length={0.3}
                  radius={0.095}
                  color="#243948"
                  rotation={[Math.PI / 2, 0, 0]}
                />
                <Limb
                  position={[x, -0.47, 0.49]}
                  length={0.42}
                  radius={0.09}
                  color="#243948"
                />
              </>
            ) : (
              <Limb
                position={[x, -0.28, 0]}
                length={0.57}
                radius={0.13}
                color="#243948"
              />
            )}
            <Solid
              position={[x, -0.68, pose === "seated" ? 0.56 : 0.1]}
              size={[0.27, 0.17, 0.47]}
              round={0.075}
              color="#34464d"
              rough={0.75}
            />
            <Solid
              position={[x, -0.735, pose === "seated" ? 0.56 : 0.1]}
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
        {pose === "seated" ? (
          [-1, 1].map((side) => (
            <group key={side}>
              <Limb
                position={[side * 0.35, 1.17, 0.06]}
                length={0.24}
                radius={0.1}
                color={color}
                rotation={[-0.32, 0, -side * 0.09]}
              />
              <Limb
                position={[side * 0.32, 1, 0.15]}
                length={0.14}
                radius={0.075}
                color={color}
                rotation={[Math.PI / 2, 0, 0]}
              />
              <Limb
                position={[side * 0.28, 0.98, 0.22]}
                length={0.055}
                radius={0.065}
                color={skin}
              />
            </group>
          ))
        ) : (
          <>
            <group
              ref={leftArm}
              position={[-0.42, 1.03, 0]}
              rotation={[0.12, 0, -0.12]}
            >
              <Limb
                position={[0, 0, 0]}
                length={0.4}
                radius={0.115}
                color={color}
              />
              <Limb
                position={[-0.03, -0.34, 0.03]}
                length={0.09}
                radius={0.09}
                color={skin}
              />
            </group>
            <group
              ref={rightArm}
              position={[0.42, 1.03, 0]}
              rotation={[-0.07, 0, 0.12]}
            >
              <Limb
                position={[0, 0, 0]}
                length={0.4}
                radius={0.115}
                color={color}
              />
              <Limb
                position={[0.03, -0.34, 0.03]}
                length={0.09}
                radius={0.09}
                color={skin}
              />
            </group>
          </>
        )}
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
          <group ref={mouth} position={[0, -0.14, 0.236]}>
            <Solid
              position={[0, 0, 0]}
              size={[0.09, 0.016, 0.017]}
              round={0.007}
              color="#71513f"
            />
          </group>
        </group>
      </group>
      {children}
    </group>
  );
}
