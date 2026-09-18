import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { Position } from "../game/types";
import { Solid } from "./ArtPrimitives";
import { PersonaClothes, PersonaHead } from "./CharacterPersona";

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

// The animated groups remain the rig: details below move with the existing
// body, arm and head refs used by interviews and the opening cinematic.
function Hand({ side, skin }: { side: number; skin: string }) {
  return (
    <group position={[side * 0.018, -0.34, 0.035]}>
      <Solid
        position={[0, 0, 0]}
        size={[0.115, 0.155, 0.08]}
        round={0.035}
        color={skin}
        rough={0.85}
      />
      <Limb
        position={[-side * 0.055, 0.015, 0.018]}
        length={0.04}
        radius={0.025}
        color={skin}
        rotation={[0.25, 0, side * 0.35]}
      />
    </group>
  );
}

function Workwear({ name, trim }: { name: string; trim: string }) {
  const guard = name === "Jordan";
  const janitor = name === "Alex";
  const contractor = name === "Sam";
  return (
    <>
      {/* A split collar leaves the neck visible and follows the shoulder line. */}
      {[-1, 1].map((side) => (
        <Solid
          key={side}
          position={[side * 0.105, 1.365, 0.184]}
          rotation={[0, 0, side * 0.35]}
          size={[0.14, 0.09, 0.03]}
          round={0.015}
          color={trim}
        />
      ))}
      <Solid
        position={[0, 1.05, 0.198]}
        size={[0.018, 0.49, 0.013]}
        color={trim}
      />
      <Solid
        position={[0, 0.785, 0]}
        size={[0.57, 0.055, 0.36]}
        round={0.018}
        color="#343a36"
      />
      <Solid
        position={[0, 0.786, 0.191]}
        size={[0.065, 0.04, 0.016]}
        round={0.008}
        color="#a69a7d"
      />
      {(janitor || contractor) && (
        <>
          <Solid
            position={[0.17, 1.17, 0.201]}
            size={[0.135, 0.15, 0.023]}
            round={0.012}
            color={trim}
          />
          <Solid
            position={[0.17, 1.225, 0.216]}
            size={[0.145, 0.025, 0.014]}
            round={0.005}
            color={janitor ? "#a9b7a0" : "#ad9c7c"}
          />
          <Solid
            position={[-0.16, 1.23, 0.208]}
            size={[0.13, 0.045, 0.018]}
            round={0.008}
            color="#d9d1b4"
          />
        </>
      )}
      {guard && (
        <>
          <mesh position={[-0.16, 1.23, 0.212]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.048, 0.038, 0.018, 6]} />
            <meshStandardMaterial
              color="#c9b67d"
              metalness={0.5}
              roughness={0.55}
            />
          </mesh>
          <Solid
            position={[0.18, 1.17, 0.221]}
            size={[0.09, 0.13, 0.045]}
            round={0.01}
            color="#20333b"
          />
          <Solid
            position={[0.2, 1.275, 0.22]}
            size={[0.013, 0.105, 0.013]}
            color="#424f52"
          />
          {[-1, 1].map((side) => (
            <Solid
              key={side}
              position={[side * 0.255, 1.38, 0.01]}
              size={[0.12, 0.022, 0.2]}
              round={0.008}
              color="#b5aa89"
            />
          ))}
        </>
      )}
      {janitor && (
        <Solid
          position={[0.27, 0.775, 0.2]}
          size={[0.085, 0.11, 0.025]}
          round={0.01}
          color="#a8a792"
        />
      )}
    </>
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
    name === "Alex" ? "#946544" : name === "Jordan" ? "#c3946f" : "#c2a07a";
  const shirt =
    name === "Alex"
      ? "#637b70"
      : name === "Jordan"
        ? "#3b5363"
        : name === "Sam"
          ? "#8c8168"
          : color;
  const trim =
    name === "Alex"
      ? "#455c55"
      : name === "Jordan"
        ? "#293e4b"
        : name === "Sam"
          ? "#655f50"
          : "#b8b29d";
  const trousers =
    name === "Alex"
      ? "#344f60"
      : name === "Gabby"
        ? "#343c55"
        : name === "Sam"
          ? "#424b49"
          : "#293d48";
  const hair =
    name === "Gabby"
      ? "#352820"
      : name === "Sam"
        ? "#605247"
        : name === "Alex"
          ? "#302f2b"
          : "#383b39";
  const gloves = name === "Alex" ? "#c8ad65" : skin;
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
      rightArm.current.rotation.x =
        name === "Gabby" && facing
          ? -1.1
          : speaking
            ? -0.55 + Math.sin(t * 8.5) * 0.42
            : -0.07;
      rightArm.current.rotation.z =
        name === "Gabby" && facing ? 0.15 : speaking ? 0.72 : 0.12;
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
                  color={trousers}
                  rotation={[Math.PI / 2, 0, 0]}
                />
                <Limb
                  position={[x, -0.47, 0.49]}
                  length={0.42}
                  radius={0.09}
                  color={trousers}
                />
              </>
            ) : (
              <Limb
                position={[x, -0.28, 0]}
                length={0.57}
                radius={0.112}
                color={trousers}
              />
            )}
            <Solid
              position={[x, -0.68, pose === "seated" ? 0.56 : 0.1]}
              size={[0.235, 0.15, 0.36]}
              round={0.055}
              color={
                name === "Alex" || name === "Sam"
                  ? "#584637"
                  : name === "Gabby"
                    ? "#e4d6be"
                    : "#303b3f"
              }
              rough={0.75}
            />
            <Solid
              position={[x, -0.735, pose === "seated" ? 0.56 : 0.1]}
              size={[0.245, 0.035, 0.37]}
              round={0.018}
              color="#747c72"
            />
          </group>
        ))}
        <Solid
          position={[0, 1.08, 0]}
          size={[
            name === "Jordan" ? 0.68 : name === "Gabby" ? 0.57 : 0.63,
            0.68,
            0.38,
          ]}
          round={0.12}
          color={shirt}
          rough={0.92}
        />
        {name !== "Gabby" && <Workwear name={name} trim={trim} />}
        <PersonaClothes name={name} />
        {pose === "seated" ? (
          [-1, 1].map((side) => (
            <group key={side}>
              <Limb
                position={[side * 0.35, 1.17, 0.06]}
                length={0.24}
                radius={0.1}
                color={shirt}
                rotation={[-0.32, 0, -side * 0.09]}
              />
              <Limb
                position={[side * 0.32, 1, 0.15]}
                length={0.14}
                radius={0.075}
                color={shirt}
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
                length={0.34}
                radius={0.105}
                color={shirt}
              />
              <Limb
                position={[0, -0.22, 0.025]}
                length={0.06}
                radius={0.081}
                color={trim}
              />
              <Hand side={-1} skin={gloves} />
            </group>
            <group
              ref={rightArm}
              position={[0.42, 1.03, 0]}
              rotation={[-0.07, 0, 0.12]}
            >
              <Limb
                position={[0, 0, 0]}
                length={0.34}
                radius={0.105}
                color={shirt}
              />
              <Limb
                position={[0, -0.22, 0.025]}
                length={0.06}
                radius={0.081}
                color={trim}
              />
              <Hand side={1} skin={gloves} />
              {name === "Gabby" && (
                <group position={[0, -0.28, 0.07]} rotation={[0.25, 0, 0]}>
                  <mesh>
                    <boxGeometry args={[0.14, 0.24, 0.025]} />
                    <meshStandardMaterial color="#101c25" roughness={0.35} />
                  </mesh>
                  <mesh position={[0, 0, 0.014]}>
                    <planeGeometry args={[0.11, 0.19]} />
                    <meshBasicMaterial color={facing ? "#77efda" : "#334b55"} />
                  </mesh>
                </group>
              )}
            </group>
          </>
        )}
        <Limb position={[0, 1.46, 0]} length={0.08} radius={0.1} color={skin} />
        <group ref={head} position={[0, 1.73, 0]}>
          <mesh
            scale={[
              name === "Jordan" ? 0.245 : name === "Gabby" ? 0.22 : 0.235,
              0.295,
              0.225,
            ]}
            castShadow
          >
            <sphereGeometry args={[1, 20, 16]} />
            <meshStandardMaterial color={skin} roughness={0.75} />
          </mesh>
          <mesh
            position={[0, 0.165, -0.04]}
            scale={[0.242, name === "Alex" ? 0.145 : 0.165, 0.222]}
            castShadow
          >
            <sphereGeometry args={[1, 18, 12]} />
            <meshStandardMaterial color={hair} roughness={0.9} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh
              key={side}
              position={[side * 0.228, -0.015, -0.015]}
              scale={[0.04, 0.065, 0.04]}
              castShadow
            >
              <sphereGeometry args={[1, 10, 8]} />
              <meshStandardMaterial color={skin} roughness={0.85} />
            </mesh>
          ))}
          {name === "Sam" && (
            <mesh
              position={[0.08, 0.215, 0.035]}
              rotation={[0, 0, -0.2]}
              scale={[0.15, 0.08, 0.19]}
              castShadow
            >
              <sphereGeometry args={[1, 14, 10]} />
              <meshStandardMaterial color={hair} roughness={0.95} />
            </mesh>
          )}
          <PersonaHead name={name} hair={hair} />
          {[-0.082, 0.082].map((x) => (
            <group key={x}>
              <mesh position={[x, 0.025, 0.212]} scale={[0.022, 0.026, 0.012]}>
                <sphereGeometry args={[1, 8, 6]} />
                <meshStandardMaterial color="#172731" />
              </mesh>
              <Solid
                position={[x, 0.082, 0.206]}
                size={[0.065, 0.018, 0.016]}
                round={0.009}
                color={hair}
              />
            </group>
          ))}
          <mesh position={[0, -0.04, 0.23]} scale={[0.034, 0.047, 0.035]}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial color={skin} />
          </mesh>
          <group ref={mouth} position={[0, -0.135, 0.204]}>
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
