import { useEffect, useMemo, useRef, useState } from "react";
import { Environment, Html, Lightformer } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  HalfFloatType,
  Vector2,
  Vector3,
  WebGLRenderTarget,
  type BufferGeometry,
  type Group,
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

function Rain() {
  const geometry = useRef<BufferGeometry>(null);
  const drops = useMemo(() => {
    let seed = 21901;
    const random = () =>
      ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const positions = new Float32Array(360 * 6);
    for (let i = 0; i < positions.length; i += 6) {
      const x = (random() - 0.5) * 53,
        y = random() * 17,
        z = 9.5 + random() * 13;
      positions.set([x, y, z, x - 0.045, y + 0.4, z], i);
    }
    return positions;
  }, []);
  useFrame((_, dt) => {
    if (!geometry.current) return;
    const position = geometry.current.attributes.position as BufferAttribute;
    for (let i = 0; i < drops.length; i += 6) {
      drops[i + 1] -= Math.min(dt, 0.1) * 7;
      if (drops[i + 1] < 0.1) drops[i + 1] = 17;
      drops[i + 4] = drops[i + 1] + 0.4;
    }
    position.needsUpdate = true;
  });
  return (
    <lineSegments frustumCulled={false}>
      <bufferGeometry ref={geometry}>
        <bufferAttribute attach="attributes-position" args={[drops, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        color="#92b8cb"
        transparent
        opacity={0.12}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </lineSegments>
  );
}

function RenderPipeline({
  enabled,
  diagnostics,
}: {
  enabled: boolean;
  diagnostics: boolean;
}) {
  const { gl, scene, camera, size } = useThree();
  const pipeline = useRef<EffectComposer | null>(null);
  const hud = useRef<Group>(null);
  const hudDirection = useRef(new Vector3());
  const shadowWarmup = useRef(3);
  const timer = useRef({ frames: 0, seconds: 0, calls: 0, triangles: 0 });
  const [stats, setStats] = useState("");
  useEffect(() => {
    // Buildings, furniture and the sun are fixed. Cache their shadow map instead
    // of drawing the whole district a second time on every animation frame.
    const previous = gl.shadowMap.autoUpdate;
    gl.shadowMap.autoUpdate = false;
    shadowWarmup.current = 3;
    return () => {
      gl.shadowMap.autoUpdate = previous;
      gl.shadowMap.needsUpdate = true;
    };
  }, [gl]);
  useEffect(() => {
    if (!enabled) return;
    const target = new WebGLRenderTarget(1, 1, {
      type: HalfFloatType,
      samples: 2,
    });
    const composer = new EffectComposer(gl, target);
    composer.setPixelRatio(Math.min(gl.getPixelRatio(), 1));
    const render = new RenderPass(scene, camera);
    // Only genuinely bright lamps/signage bloom; stone, clothes and UI stay crisp.
    const bloom = new UnrealBloomPass(new Vector2(1, 1), 0.22, 0.45, 1.25);
    const output = new OutputPass();
    composer.addPass(render);
    composer.addPass(bloom);
    composer.addPass(output);
    composer.setSize(size.width, size.height);
    pipeline.current = composer;
    return () => {
      pipeline.current = null;
      bloom.dispose();
      output.dispose();
      composer.dispose();
    };
  }, [enabled, gl, scene, camera]);
  useEffect(() => {
    pipeline.current?.setSize(size.width, size.height);
  }, [size]);
  useFrame((_, dt) => {
    if (hud.current) {
      camera.getWorldDirection(hudDirection.current);
      hud.current.position.copy(camera.position).add(hudDirection.current);
    }
    if (shadowWarmup.current > 0) {
      gl.shadowMap.needsUpdate = true;
      shadowWarmup.current--;
    }
    const oldReset = gl.info.autoReset;
    gl.info.autoReset = false;
    gl.info.reset();
    if (pipeline.current) pipeline.current.render(dt);
    else gl.render(scene, camera);
    if (diagnostics) {
      const sample = timer.current;
      sample.frames++;
      sample.seconds += dt;
      sample.calls += gl.info.render.calls;
      sample.triangles += gl.info.render.triangles;
      if (sample.seconds > 1.5) {
        setStats(
          `${Math.round(sample.frames / sample.seconds)} FPS · ${Math.round(sample.calls / sample.frames)} draws · ${Math.round(sample.triangles / sample.frames / 1000)}k triangles`,
        );
        timer.current = { frames: 0, seconds: 0, calls: 0, triangles: 0 };
      }
    }
    gl.info.autoReset = oldReset;
  }, 1);
  return diagnostics ? (
    <group ref={hud}>
      <Html
        fullscreen
        calculatePosition={(_, __, viewport) => [
          viewport.width / 2,
          viewport.height / 2,
        ]}
        style={{ pointerEvents: "none" }}
      >
        <div
          style={{
            position: "absolute",
            top: 105,
            right: 30,
            padding: "9px 12px",
            background: "#102330dd",
            color: "#c8dfdc",
            font: "12px monospace",
          }}
        >
          {enabled ? "Cinematic" : "Performance"} · {stats}
          <br />V toggles bloom / rain
        </div>
      </Html>
    </group>
  ) : null;
}

export default function CinematicAtmosphere() {
  const [enabled, setEnabled] = useState(
    () =>
      new URLSearchParams(window.location.search).get("graphics") !==
      "baseline",
  );
  const diagnostics = new URLSearchParams(window.location.search).has(
    "diagnostics",
  );
  useEffect(() => {
    const toggle = (e: KeyboardEvent) => {
      if (
        e.code === "KeyV" &&
        !e.repeat &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target instanceof HTMLSelectElement)
      )
        setEnabled((value) => !value);
    };
    window.addEventListener("keydown", toggle);
    return () => window.removeEventListener("keydown", toggle);
  }, []);
  return (
    <>
      <color attach="background" args={["#091722"]} />
      <fog attach="fog" args={["#102735", 32, 115]} />
      <ambientLight intensity={0.32} color="#bdd4dd" />
      <hemisphereLight args={["#8baccc", "#74614e", 0.65]} />
      <directionalLight
        position={[-24, 38, 18]}
        intensity={0.85}
        color="#9bbbd8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-34}
        shadow-camera-right={34}
        shadow-camera-top={43}
        shadow-camera-bottom={-30}
        shadow-camera-far={110}
        shadow-normalBias={0.05}
      />
      <Environment frames={1} resolution={64} environmentIntensity={0.48}>
        <color attach="background" args={["#1c3443"]} />
        <Lightformer
          position={[-10, 8, 8]}
          scale={[14, 5, 1]}
          intensity={2}
          color="#efc99a"
          target={[0, 0, 0]}
        />
        <Lightformer
          position={[12, 10, -10]}
          scale={[20, 10, 1]}
          intensity={1.8}
          color="#8dbbcd"
          target={[0, 0, 0]}
        />
        <Lightformer
          position={[0, 15, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[25, 25, 1]}
          intensity={0.9}
          color="#c0d4de"
        />
      </Environment>
      {enabled && <Rain />}
      <RenderPipeline enabled={enabled} diagnostics={diagnostics} />
    </>
  );
}
