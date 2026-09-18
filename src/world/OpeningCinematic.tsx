import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type RefObject,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  AdditiveBlending,
  PerspectiveCamera,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  type PointLight,
} from "three";
import { Solid } from "./ArtPrimitives";
import StylizedCharacter from "./StylizedCharacter";
import { OPENING_SEATED_POSITION } from "./cafeLayout";
import {
  OPENING_DURATION,
  openingFrame,
  type OpeningShot,
} from "./openingTimeline";
import type { OpeningAudio } from "./openingAudio";

export default function OpeningCinematic({
  skipRequested,
  audio,
  onShot,
  onComplete,
}: {
  skipRequested: boolean;
  audio: RefObject<OpeningAudio>;
  onShot: (shot: OpeningShot) => void;
  onComplete: () => void;
}) {
  const { camera, gl } = useThree();
  const startedAt = useRef<number | null>(null);
  const done = useRef(false);
  const time = useRef(0);
  const playerTime = useRef(0);
  const currentShot = useRef<OpeningShot>("cafe");
  const root = useRef<Group>(null);
  const seated = useRef<Group>(null);
  const player = useRef<Group>(null);
  const runner = useRef<Group>(null);
  const flash = useRef<Mesh>(null);
  const flashLight = useRef<PointLight>(null);
  const emergencyLight = useRef<PointLight>(null);
  const smoke = useRef<(Mesh | null)[]>([]);
  const sparks = useRef<(Mesh | null)[]>([]);

  const setCamera = useCallback(
    (seconds: number) => {
      const frame = openingFrame(seconds);
      camera.position.set(...frame.camera);
      camera.rotation.order = "YXZ";
      camera.lookAt(...frame.lookAt);
      if (camera instanceof PerspectiveCamera && camera.fov !== frame.fov) {
        camera.fov = frame.fov;
        camera.updateProjectionMatrix();
      }
      return frame;
    },
    [camera],
  );

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    setCamera(OPENING_DURATION);
    if (root.current) root.current.visible = false;
    // The shadow cache must not retain any temporary actor after the handoff.
    gl.shadowMap.needsUpdate = true;
    onComplete();
  }, [gl, onComplete, setCamera]);

  useLayoutEffect(() => {
    setCamera(0);
  }, [setCamera]);
  useEffect(() => {
    if (skipRequested) finish();
  }, [skipRequested, finish]);

  useFrame(() => {
    if (done.current) return;
    const now = performance.now();
    if (startedAt.current === null) startedAt.current = now;
    const seconds = (now - startedAt.current) / 1000;
    if (seconds >= OPENING_DURATION) {
      finish();
      return;
    }
    time.current = seconds;
    playerTime.current = seconds < 7.8 ? Math.max(0, seconds - 5) : 0;
    const frame = setCamera(seconds);
    if (frame.shot !== currentShot.current) {
      currentShot.current = frame.shot;
      onShot(frame.shot);
    }
    if (seconds >= 3 && seconds < 5) audio.current?.blast();
    if (seated.current) seated.current.visible = seconds < 5;
    if (player.current) {
      player.current.visible = seconds >= 5 && seconds < 9;
      player.current.position.set(...frame.player);
    }
    if (runner.current) {
      runner.current.visible = seconds >= 5 && seconds < 8.3;
      runner.current.position.set(...frame.runner);
      runner.current.rotation.y = frame.runnerYaw;
    }
    if (flash.current) {
      flash.current.visible = frame.flash > 0.001;
      flash.current.scale.setScalar(1 + (1 - frame.flash) * 2);
      (flash.current.material as MeshBasicMaterial).opacity =
        frame.flash * 0.85;
    }
    if (flashLight.current) flashLight.current.intensity = frame.flash * 950;
    if (emergencyLight.current)
      emergencyLight.current.intensity = frame.emergency * 100;
    smoke.current.forEach((mesh, i) => {
      if (!mesh) return;
      const age = Math.max(0, seconds - 3);
      mesh.visible = frame.smoke > 0;
      mesh.position.set(
        Math.sin(i * 2.4) * (0.5 + age * 0.23),
        0.9 + (i % 3) * 0.45 + age * 0.35,
        8.15 + Math.cos(i * 2.4) * 0.25 + age * 0.3,
      );
      mesh.scale.setScalar(0.35 + age * 0.19 + (i % 3) * 0.13);
      (mesh.material as MeshBasicMaterial).opacity = frame.smoke * 0.19;
    });
    sparks.current.forEach((mesh, i) => {
      if (!mesh) return;
      const age = seconds - 3;
      mesh.visible = age >= 0 && age < 0.85;
      mesh.position.set(
        Math.sin(i * 2.1) * age * 3.2,
        1.6 + Math.cos(i * 1.7) * age * 2 - age * age * 3,
        8.3 + age * (1 + (i % 3)),
      );
      mesh.scale.setScalar(Math.max(0.01, 0.05 * (1 - age)));
    });
  });

  return (
    <group ref={root} name="opening-cinematic">
      <group
        ref={seated}
        position={OPENING_SEATED_POSITION}
        rotation={[0, Math.PI, 0]}
      >
        <StylizedCharacter
          position={[0, 0, 0]}
          color="#a98556"
          name="Detective"
          pose="seated"
          animationTime={time}
        />
      </group>
      <group ref={player} visible={false} rotation={[0, Math.PI, 0]}>
        <StylizedCharacter
          position={[0, 0, 0]}
          color="#a98556"
          name="Detective"
          pose="walking"
          animationTime={playerTime}
        />
      </group>
      <group ref={runner} visible={false}>
        <group rotation={[0.1, 0, 0]}>
          <StylizedCharacter
            position={[0, 0, 0]}
            color="#263238"
            name="Unknown"
            pose="running"
            animationTime={time}
          />
          {/* A hood conceals the face; neither model nor clothing identifies a suspect. */}
          <mesh position={[0, 1.78, 0.035]} scale={[0.33, 0.37, 0.3]}>
            <sphereGeometry args={[1, 12, 10]} />
            <meshStandardMaterial color="#19252c" roughness={1} />
          </mesh>
          <Solid
            position={[0.61, 0.57, 0.04]}
            size={[0.4, 0.47, 0.64]}
            round={0.11}
            color="#9b825e"
          />
          <mesh position={[0.6, 0.87, 0.04]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.17, 0.032, 5, 12, Math.PI]} />
            <meshStandardMaterial color="#443b31" />
          </mesh>
        </group>
      </group>
      <pointLight
        ref={flashLight}
        position={[0, 2, 7.3]}
        color="#ffe8c3"
        distance={32}
        intensity={0}
      />
      <pointLight
        ref={emergencyLight}
        position={[0, 2.5, 7.5]}
        color="#ff243b"
        distance={20}
        intensity={0}
      />
      <mesh ref={flash} position={[0, 2.2, 7.8]} visible={false}>
        <sphereGeometry args={[1.1, 12, 10]} />
        <meshBasicMaterial
          color="#fff0d3"
          transparent
          opacity={0}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh
          key={`smoke-${i}`}
          ref={(node) => {
            smoke.current[i] = node;
          }}
          visible={false}
        >
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial
            color={i % 2 ? "#b5a8a1" : "#6d7579"}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh
          key={`spark-${i}`}
          ref={(node) => {
            sparks.current[i] = node;
          }}
          visible={false}
        >
          <octahedronGeometry args={[1]} />
          <meshBasicMaterial color="#ffd9a0" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
