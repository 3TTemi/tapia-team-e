import { Suspense, useEffect, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Vector3, type Group } from "three";
import { clues, obstacles, characters } from "../game/case";
import type { ClueId, Position, SuspectId, TargetId } from "../game/types";
import CityEnvironment from "./CityEnvironment";
import { hasClearSight, isWorldBlocked, PLAYER_SPAWN } from "./layout";
import { movePlayer } from "./movement";
import { Solid, WorldMaterials, Plant } from "./ArtPrimitives";
import StylizedCharacter from "./StylizedCharacter";
import OpeningCinematic from "./OpeningCinematic";
import { OPENING_HANDOFF, type OpeningShot } from "./openingTimeline";
import type { OpeningAudio } from "./openingAudio";
import type { CaseVerdict } from "../game/submission";
import CaseStation from "./CaseStation";
import { caseStation } from "./caseSubmissionLocation";
import VerdictCinematic from "./VerdictCinematic";

function Block({
  position,
  size,
  color,
  glow = false,
}: {
  position: Position;
  size: Position;
  color: string;
  glow?: boolean;
}) {
  return (
    <Solid
      position={position}
      size={size}
      color={color}
      rough={0.58}
      metal={0.25}
      glow={glow ? 1.2 : 0}
      round={Math.min(0.04, ...size.map((v) => v * 0.18))}
    />
  );
}

function Label({
  position,
  children,
  className = "",
}: {
  position: Position;
  children: React.ReactNode;
  className?: string;
}) {
  const anchor = useRef<Group>(null);
  const label = useRef<HTMLDivElement>(null);
  const worldPosition = useRef(new Vector3());
  useFrame(({ camera }) => {
    if (!anchor.current || !label.current) return;
    anchor.current.getWorldPosition(worldPosition.current);
    const distance = camera.position.distanceTo(worldPosition.current);
    label.current.style.opacity = String(
      Math.max(0, Math.min(1, (11 - distance) / 3)),
    );
  });
  return (
    <group ref={anchor} position={position}>
      <Html center occlude distanceFactor={8} style={{ pointerEvents: "none" }}>
        <div
          ref={label}
          className={`world-label ${className}`}
          style={{ opacity: 0 }}
        >
          {children}
        </div>
      </Html>
    </group>
  );
}

function SpeechBubble({
  name,
  text,
  thinking,
  streaming,
}: {
  name: string;
  text: string;
  thinking: boolean;
  streaming?: boolean;
}) {
  return (
    <Html style={{ pointerEvents: "none" }} zIndexRange={[20, 0]}>
      <div
        className={`speech-bubble ${thinking ? "thinking" : ""} ${streaming ? "streaming" : ""}`}
        aria-live="polite"
      >
        <small>{name}</small>
        <p>{thinking ? "..." : text}</p>
      </div>
    </Html>
  );
}

function Hacker({
  position,
  color,
  name,
  role,
  speaking,
  line,
  thinking,
  streaming,
}: {
  position: Position;
  color: string;
  name: string;
  role: string;
  speaking: boolean;
  line: string | null;
  thinking: boolean;
  streaming?: boolean;
}) {
  return (
    <StylizedCharacter
      position={position}
      color={color}
      name={name}
      speaking={speaking}
      facing={Boolean(line)}
    >
      {line && name !== "Lucía" ? (
        <group position={[0, 2.15, 0]}>
          <SpeechBubble
            name={name}
            text={line}
            thinking={thinking}
            streaming={streaming}
          />
        </group>
      ) : (
        <Label position={[0, 2.4, 0]}>
          <span style={{ color }}>{name}</span>
          <small>{role}</small>
        </Label>
      )}
    </StylizedCharacter>
  );
}

function Desk({ x, z, width, depth }: (typeof obstacles)[number]) {
  return (
    <group position={[x, 0, z]}>
      <Block
        position={[0, 0.94, 0]}
        size={[width, 0.16, depth]}
        color="#9b7152"
      />
      {[-1, 1].flatMap((a) =>
        [-1, 1].map((b) => (
          <Block
            key={`${a}${b}`}
            position={[a * (width / 2 - 0.15), 0.45, b * (depth / 2 - 0.12)]}
            size={[0.13, 0.9, 0.13]}
            color="#344241"
          />
        )),
      )}
    </group>
  );
}

function Monitor({
  position,
  color = "#78dcb3",
}: {
  position: Position;
  color?: string;
}) {
  return (
    <group position={position}>
      <Block position={[0, 0.26, 0]} size={[0.9, 0.57, 0.09]} color="#172529" />
      <Block
        position={[0, 0.26, 0.055]}
        size={[0.79, 0.45, 0.015]}
        color="#183b3c"
        glow
      />
      {[0, 1, 2].map((i) => (
        <Block
          key={i}
          position={[-0.1, 0.36 - i * 0.1, 0.07]}
          size={[0.42 - i * 0.07, 0.025, 0.01]}
          color={color}
          glow
        />
      ))}
      <Block
        position={[0, -0.09, 0]}
        size={[0.12, 0.2, 0.12]}
        color="#263d3c"
      />
      <Block
        position={[0, -0.18, 0.1]}
        size={[0.55, 0.05, 0.32]}
        color="#263d3c"
      />
    </group>
  );
}

function Room({
  collected,
  target,
  solved,
  talkingTo,
  speaking,
  bubbleText,
  thinking,
  streaming,
}: {
  collected: ClueId[];
  target: TargetId | null;
  solved: boolean;
  talkingTo: SuspectId | null;
  speaking: boolean;
  bubbleText: string | null;
  thinking: boolean;
  streaming?: boolean;
}) {
  return (
    <>
      <CityEnvironment />
      <CaseStation focused={target === "submission"} solved={solved} />
      {obstacles.map((desk, i) => (
        <Desk key={i} {...desk} />
      ))}
      <Monitor position={[-5.3, 1.23, -4.7]} color="#e7a0aa" />
      <Monitor position={[4, 1.23, -4.7]} />
      <Monitor position={[-5.8, 1.23, 2.2]} color="#f2c177" />
      <Block
        position={[-3.6, 1.06, -4.5]}
        size={[0.78, 0.09, 0.62]}
        color="#292f36"
      />
      <Block
        position={[-3.6, 1.11, -4.5]}
        size={[0.56, 0.02, 0.4]}
        color="#bc9876"
      />
      <Label position={[-3.6, 1.5, -4.5]} className="missing-label">
        CASH // MISSING
      </Label>
      <Block
        position={[5.2, 1.04, -4.5]}
        size={[0.5, 0.035, 0.42]}
        color="#ede4cf"
      />
      <Block
        position={[5.2, 1.064, -4.5]}
        size={[0.37, 0.015, 0.27]}
        color="#779884"
      />
      <Block
        position={[0, 1.04, -7.8]}
        size={[0.38, 0.035, 0.52]}
        color="#e3d4b7"
      />
      <Plant position={[-6.9, 0, -7]} scale={0.9} />
      <Plant position={[6.8, 0, 4.8]} scale={0.9} />
      <Block
        position={[4.2, 1.06, -4]}
        size={[0.25, 0.15, 0.25]}
        color="#e1a366"
      />
      <Block
        position={[-4.3, 1.13, -4]}
        size={[0.15, 0.3, 0.15]}
        color="#b784a7"
      />
      {characters.map((s) => (
        <Hacker
          key={s.id}
          {...s}
          speaking={talkingTo === s.id && speaking}
          thinking={talkingTo === s.id && thinking}
          streaming={talkingTo === s.id && streaming}
          line={talkingTo === s.id ? bubbleText : null}
        />
      ))}
      {clues.map((c) => (
        <group
          key={c.id}
          position={[c.position[0], c.position[1] + 0.35, c.position[2]]}
        >
          {!collected.includes(c.id) && (
            <mesh
              rotation={[0, Math.PI / 4, Math.PI / 4]}
              scale={target === c.id ? 1.4 : 1}
            >
              <boxGeometry args={[0.09, 0.09, 0.09]} />
              <meshBasicMaterial color="#f1cc79" />
            </mesh>
          )}
        </group>
      ))}
    </>
  );
}

function Player({
  active,
  keyboardMode,
  onTarget,
  onLock,
  enterAtBank,
}: {
  active: boolean;
  keyboardMode: boolean;
  onTarget: (id: TargetId | null) => void;
  onLock: (locked: boolean) => void;
  enterAtBank: boolean;
}) {
  const { camera, gl } = useThree();
  const keys = useRef(new Set<string>());
  const previous = useRef<TargetId | null>(null);
  const direction = useRef(new Vector3());
  const deltaVector = useRef(new Vector3());
  useEffect(() => {
    camera.position.set(...(enterAtBank ? OPENING_HANDOFF : PLAYER_SPAWN));
    camera.rotation.set(0, 0, 0, "YXZ");
  }, [camera, enterAtBank]);
  useEffect(() => {
    camera.rotation.order = "YXZ";
    const down = (e: KeyboardEvent) => {
      if (
        active &&
        (keyboardMode || document.pointerLockElement === gl.domElement) &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLSelectElement)
      ) {
        keys.current.add(e.code);
        if (e.code.startsWith("Arrow")) e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.code);
    const clear = () => keys.current.clear();
    const lock = () => {
      clear();
      onLock(document.pointerLockElement === gl.domElement);
    };
    const move = (e: MouseEvent) => {
      if (!active || document.pointerLockElement !== gl.domElement) return;
      camera.rotation.y -= e.movementX * 0.002;
      camera.rotation.x = Math.max(
        -1.3,
        Math.min(1.3, camera.rotation.x - e.movementY * 0.002),
      );
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    document.addEventListener("pointerlockchange", lock);
    document.addEventListener("mousemove", move);
    return () => {
      clear();
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
      document.removeEventListener("pointerlockchange", lock);
      document.removeEventListener("mousemove", move);
    };
  }, [active, keyboardMode, camera, gl, onLock]);
  useFrame((_, dt) => {
    if (!active) {
      if (previous.current !== null) {
        previous.current = null;
        onTarget(null);
      }
      return;
    }
    if (
      active &&
      (keyboardMode || document.pointerLockElement === gl.domElement)
    ) {
      const forward =
        Number(keys.current.has("KeyW") || keys.current.has("ArrowUp")) -
        Number(keys.current.has("KeyS") || keys.current.has("ArrowDown"));
      const side =
        Number(keys.current.has("KeyD") || keys.current.has("ArrowRight")) -
        Number(keys.current.has("KeyA") || keys.current.has("ArrowLeft"));
      camera.rotation.y +=
        (Number(keys.current.has("KeyQ")) - Number(keys.current.has("KeyR"))) *
        Math.min(dt, 0.15) *
        1.8;
      camera.rotation.x = Math.max(
        -1.3,
        Math.min(
          1.3,
          camera.rotation.x +
            (Number(keys.current.has("KeyT")) -
              Number(keys.current.has("KeyG"))) *
              Math.min(dt, 0.15),
        ),
      );
      const blocked = (x: number, z: number) =>
        isWorldBlocked(x, z, obstacles) ||
        characters.some(
          (s) => Math.hypot(x - s.position[0], z - s.position[2]) < 0.65,
        );
      movePlayer(
        camera.position,
        {
          forward,
          side,
          yaw: camera.rotation.y,
          deltaSeconds: dt,
          sprint:
            keys.current.has("ShiftLeft") || keys.current.has("ShiftRight"),
        },
        blocked,
      );
    }
    camera.getWorldDirection(direction.current);
    let next: TargetId | null = null;
    let closest = 3.1;
    for (const object of [...characters, ...clues, caseStation]) {
      const p = object.position;
      deltaVector.current
        .set(p[0], "role" in object ? 1.5 : p[1], p[2])
        .sub(camera.position);
      const distance = deltaVector.current.length();
      if (
        distance < closest &&
        deltaVector.current.normalize().dot(direction.current) > 0.9 &&
        hasClearSight(camera.position.x, camera.position.z, p[0], p[2])
      ) {
        closest = distance;
        next = object.id;
      }
    }
    if (next !== previous.current) {
      previous.current = next;
      onTarget(next);
    }
  });
  return null;
}

export default function World({
  active,
  keyboardMode,
  collected,
  target,
  talkingTo,
  speaking,
  bubbleText,
  thinking,
  streaming,
  onTarget,
  onLock,
  cinematic,
  skipIntro,
  introAudio,
  onIntroShot,
  onIntroComplete,
  enterAtBank,
  solved,
  verdict,
  onVerdictComplete,
}: {
  active: boolean;
  keyboardMode: boolean;
  collected: ClueId[];
  target: TargetId | null;
  talkingTo: SuspectId | null;
  speaking: boolean;
  bubbleText: string | null;
  thinking: boolean;
  streaming?: boolean;
  onTarget: (id: TargetId | null) => void;
  onLock: (locked: boolean) => void;
  cinematic: boolean;
  skipIntro: boolean;
  introAudio: RefObject<OpeningAudio>;
  onIntroShot: (shot: OpeningShot) => void;
  onIntroComplete: () => void;
  enterAtBank: boolean;
  solved: boolean;
  verdict: CaseVerdict | null;
  onVerdictComplete: () => void;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: PLAYER_SPAWN, fov: 65, near: 0.1, far: 160 }}
      gl={{ antialias: true }}
    >
      <Suspense
        fallback={
          <Html
            center
            style={{
              color: "#dce5d6",
              whiteSpace: "nowrap",
              font: "14px sans-serif",
            }}
          >
            Opening the café…
          </Html>
        }
      >
        <WorldMaterials>
          <Room
            collected={collected}
            target={target}
            solved={solved}
            talkingTo={talkingTo}
            speaking={speaking}
            bubbleText={bubbleText}
            thinking={thinking}
            streaming={streaming}
          />
          <Player
            active={active}
            keyboardMode={keyboardMode}
            onTarget={onTarget}
            onLock={onLock}
            enterAtBank={enterAtBank}
          />
          {cinematic && (
            <OpeningCinematic
              skipRequested={skipIntro}
              audio={introAudio}
              onShot={onIntroShot}
              onComplete={onIntroComplete}
            />
          )}
          {verdict && (
            <VerdictCinematic
              verdict={verdict}
              onComplete={onVerdictComplete}
            />
          )}
        </WorldMaterials>
      </Suspense>
    </Canvas>
  );
}
