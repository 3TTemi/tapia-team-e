import { useLayoutEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, type PointLight } from "three";
import { suspects } from "../game/case";
import type { CaseVerdict } from "../game/submission";

export default function VerdictCinematic({
  verdict,
  onComplete,
}: {
  verdict: CaseVerdict;
  onComplete: () => void;
}) {
  const { camera } = useThree();
  const elapsed = useRef(0);
  const done = useRef(false);
  const light = useRef<PointLight>(null);
  const reducedMotion = useRef(
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const suspect = suspects.find((person) => person.id === verdict.suspectId)!;
  useLayoutEffect(() => {
    const position = camera.position.clone();
    const rotation = camera.quaternion.clone();
    const fov = camera instanceof PerspectiveCamera ? camera.fov : null;
    return () => {
      camera.position.copy(position);
      camera.quaternion.copy(rotation);
      if (camera instanceof PerspectiveCamera && fov !== null) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }
    };
  }, [camera]);
  useFrame((_, dt) => {
    if (done.current) return;
    elapsed.current += dt;
    const progress = Math.min(1, elapsed.current / 3.6);
    if (!reducedMotion.current) {
      const ease = progress * progress * (3 - 2 * progress);
      camera.position.set(0, 2.1, 5.8 - ease * 1.8);
      camera.lookAt(suspect.position[0], 1.4, suspect.position[2]);
      if (camera instanceof PerspectiveCamera && camera.fov !== 55) {
        camera.fov = 55;
        camera.updateProjectionMatrix();
      }
      if (light.current)
        light.current.intensity = 3 + Math.sin(progress * Math.PI) * 4;
    }
    if (progress === 1) {
      done.current = true;
      onComplete();
    }
  });
  return (
    <pointLight
      ref={light}
      position={[suspect.position[0], 3, suspect.position[2] + 2]}
      color={verdict.status === "solved" ? "#c9e8a4" : "#d7a186"}
      intensity={3}
      distance={12}
      decay={2}
    />
  );
}
