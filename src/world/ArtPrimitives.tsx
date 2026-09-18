import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { RoundedBox, useTexture } from "@react-three/drei";
import {
  CanvasTexture,
  Color,
  Object3D,
  RepeatWrapping,
  SRGBColorSpace,
  type InstancedMesh,
  type Texture,
} from "three";
import type { Position } from "../game/types";
import { createSignCanvas } from "./signCanvas";

export const art = {
  ink: "#101e28",
  steel: "#516877",
  brass: "#bba47a",
  stone: "#899498",
  wood: "#986c45",
  cream: "#d6c7ae",
  teal: "#306365",
  warm: "#ffc785",
  cool: "#8bc2db",
};

export function InstancedBoxes({
  items,
  glow = 0,
  rough = 0.55,
  metal = 0.2,
}: {
  items: { position: Position; size: Position; color: string }[];
  glow?: number;
  rough?: number;
  metal?: number;
}) {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const object = new Object3D();
    const color = new Color();
    items.forEach((item, i) => {
      object.position.set(...item.position);
      object.scale.set(...item.size);
      object.updateMatrix();
      ref.current!.setMatrixAt(i, object.matrix);
      ref.current!.setColorAt(i, color.set(item.color));
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [items]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color="white"
        roughness={rough}
        metalness={metal}
        emissive="white"
        emissiveIntensity={glow}
      />
    </instancedMesh>
  );
}

type MaterialKind = "wood" | "stone" | "paving";
const TextureContext = createContext<Record<MaterialKind, Texture> | null>(
  null,
);

function makeSurface(kind: MaterialKind) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  let seed = 43271;
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const pixels = ctx.createImageData(512, 512);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const v = Math.floor(220 + random() * 25);
    pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = v;
    pixels.data[i + 3] = 255;
  }
  ctx.putImageData(pixels, 0, 0);
  if (kind === "wood") {
    for (let plank = 0; plank < 8; plank++) {
      ctx.fillStyle = `rgba(40,25,10,${0.03 + random() * 0.1})`;
      ctx.fillRect(plank * 64, 0, 64, 512);
      ctx.fillStyle = "rgba(25,18,12,0.4)";
      ctx.fillRect(plank * 64, 0, 1.5, 512);
      for (let grain = 0; grain < 30; grain++) {
        const x = plank * 64 + random() * 64;
        ctx.strokeStyle = `rgba(60,35,12,${random() * 0.15})`;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.bezierCurveTo(x + 10, 160, x - 9, 340, x + 3, 512);
        ctx.stroke();
      }
      ctx.fillRect(plank * 64, (plank % 3) * 170, 64, 1.5);
    }
  } else {
    ctx.strokeStyle =
      kind === "stone" ? "rgba(60,78,86,0.4)" : "rgba(35,48,55,0.6)";
    ctx.lineWidth = kind === "stone" ? 1.2 : 3;
    for (let i = 0; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 256, 0);
      ctx.lineTo(i * 256, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * 256);
      ctx.lineTo(512, i * 256);
      ctx.stroke();
    }
    if (kind === "stone") {
      for (let i = 0; i < 15; i++) {
        const y = random() * 512;
        ctx.strokeStyle = "rgba(50,78,85,0.06)";
        ctx.lineWidth = random() * 3;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(170, y + 120, 310, y - 80, 512, y + 45);
        ctx.stroke();
      }
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

export function WorldMaterials({ children }: { children: React.ReactNode }) {
  const textures = useMemo(
    () => ({
      wood: makeSurface("wood"),
      stone: makeSurface("stone"),
      paving: makeSurface("paving"),
    }),
    [],
  );
  useEffect(
    () => () => Object.values(textures).forEach((texture) => texture.dispose()),
    [textures],
  );
  return (
    <TextureContext.Provider value={textures}>
      {children}
    </TextureContext.Provider>
  );
}

export function Solid({
  position,
  size,
  color = art.ink,
  metal = 0.15,
  rough = 0.65,
  glow = 0,
  rotation,
  texture,
  round = 0,
  shadow = true,
}: {
  position: Position;
  size: Position;
  color?: string;
  metal?: number;
  rough?: number;
  glow?: number;
  rotation?: Position;
  texture?: MaterialKind;
  round?: number;
  shadow?: boolean;
}) {
  const maps = useContext(TextureContext);
  const material = (
    <meshStandardMaterial
      color={color}
      roughness={rough}
      metalness={metal}
      map={texture ? maps?.[texture] : undefined}
      emissive={color}
      emissiveIntensity={glow}
    />
  );
  return round ? (
    <RoundedBox
      position={position}
      rotation={rotation}
      args={size}
      // Drei's extruded rounded box does not clamp the bevel itself. A radius
      // larger than a thin prop's half-height folds its faces over each other.
      radius={Math.min(round, Math.min(...size) * 0.49)}
      smoothness={2}
      bevelSegments={2}
      castShadow={shadow && !glow}
      receiveShadow
    >
      {material}
    </RoundedBox>
  ) : (
    <mesh
      position={position}
      rotation={rotation}
      castShadow={shadow && !glow}
      receiveShadow
    >
      <boxGeometry args={size} />
      {material}
    </mesh>
  );
}

export function Cylinder({
  position,
  radius,
  height,
  color = art.steel,
  metal = 0.35,
  rough = 0.45,
  rotation,
  topRadius,
  glow = 0,
}: {
  position: Position;
  radius: number;
  height: number;
  color?: string;
  metal?: number;
  rough?: number;
  rotation?: Position;
  topRadius?: number;
  glow?: number;
}) {
  return (
    <mesh
      position={position}
      rotation={rotation}
      castShadow={!glow}
      receiveShadow
    >
      <cylinderGeometry args={[topRadius ?? radius, radius, height, 20]} />
      <meshStandardMaterial
        color={color}
        metalness={metal}
        roughness={rough}
        emissive={color}
        emissiveIntensity={glow}
      />
    </mesh>
  );
}

export function Sign({
  position,
  title,
  subtitle = "",
  width = 4,
  height = 1,
  rotation = 0,
  color = "#d8e5e1",
  background = "#152b35",
  border = false,
}: {
  position: Position;
  title: string;
  subtitle?: string;
  width?: number;
  height?: number;
  rotation?: number;
  color?: string;
  background?: string;
  border?: boolean;
}) {
  const texture = useMemo(() => {
    const canvas = createSignCanvas({
      title,
      subtitle,
      width,
      height,
      color,
      background,
      border,
    });
    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    result.anisotropy = 8;
    return result;
  }, [title, subtitle, width, height, color, background, border]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={position} rotation={[0, rotation, 0]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

export function BrandPanel({
  position,
  width = 12,
  rotation = 0,
}: {
  position: Position;
  width?: number;
  rotation?: number;
}) {
  const texture = useTexture("/brand/capital-one.svg");
  texture.colorSpace = SRGBColorSpace;
  const height = (width * 150) / 418;
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Solid
        position={[0, 0, 0]}
        size={[width + 0.45, height + 0.45, 0.22]}
        color={art.steel}
        metal={0.8}
        rough={0.25}
        round={0.12}
      />
      <Solid
        position={[0, 0, 0.13]}
        size={[width + 0.14, height + 0.14, 0.06]}
        color="#d1e5e2"
        glow={0.75}
        round={0.05}
        shadow={false}
      />
      <mesh position={[0, 0, 0.166]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

export function Floor({
  x,
  z,
  width,
  depth,
  kind,
  color,
}: {
  x: number;
  z: number;
  width: number;
  depth: number;
  kind: MaterialKind;
  color: string;
}) {
  const maps = useContext(TextureContext)!;
  const texture = useMemo(() => {
    const result = maps[kind].clone();
    result.repeat.set(width / 4, depth / 4);
    result.needsUpdate = true;
    return result;
  }, [maps, kind, width, depth]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={[x, 0, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial
        color={color}
        map={texture}
        roughness={kind === "wood" ? 0.62 : 0.36}
        metalness={kind === "paving" ? 0.35 : 0.12}
      />
    </mesh>
  );
}

export function Plant({
  position,
  scale = 1,
}: {
  position: Position;
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <Cylinder
        position={[0, 0.3, 0]}
        radius={0.3}
        topRadius={0.37}
        height={0.6}
        color="#9c8e78"
        rough={0.95}
        metal={0}
      />
      <Cylinder
        position={[0, 0.602, 0]}
        radius={0.33}
        height={0.025}
        color="#302e27"
        metal={0}
      />
      {Array.from({ length: 9 }, (_, i) => {
        const angle = i * 2.4;
        const x = Math.sin(angle) * 0.3,
          z = Math.cos(angle) * 0.3;
        return (
          <group key={i}>
            <Cylinder
              position={[x * 0.45, 0.95, z * 0.45]}
              radius={0.015}
              height={0.8}
              color="#497058"
              metal={0}
              rotation={[z * 0.5, 0, -x * 0.5]}
            />
            <mesh
              position={[x, 1.12 + (i % 3) * 0.12, z]}
              rotation={[Math.cos(angle) * 0.65, angle, Math.sin(angle) * 0.65]}
              scale={[0.13, 0.4, 0.045]}
              castShadow
            >
              <sphereGeometry args={[1, 10, 8]} />
              <meshStandardMaterial
                color={i % 2 ? "#48795c" : "#6b8d61"}
                roughness={0.72}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function CoffeeCup({
  position,
  ceramic = false,
}: {
  position: Position;
  ceramic?: boolean;
}) {
  return (
    <group position={position}>
      <Cylinder
        position={[0, 0.09, 0]}
        radius={0.07}
        topRadius={0.085}
        height={0.18}
        color={ceramic ? "#cbd7ce" : "#eadac0"}
        metal={0}
        rough={0.4}
      />
      <Cylinder
        position={[0, 0.184, 0]}
        radius={0.072}
        height={0.007}
        color="#4a3020"
        metal={0}
      />
      {ceramic ? (
        <mesh position={[0.09, 0.11, 0]}>
          <torusGeometry args={[0.05, 0.015, 8, 14]} />
          <meshStandardMaterial color="#cbd7ce" />
        </mesh>
      ) : (
        <Cylinder
          position={[0, 0.09, 0]}
          radius={0.081}
          height={0.06}
          color="#9e7446"
          metal={0}
        />
      )}
    </group>
  );
}
