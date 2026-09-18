import { useEffect, useMemo } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import { Solid } from "./ArtPrimitives";
import type { Position } from "../game/types";

function Patch({
  text,
  position,
  width = 0.19,
  color = "#e8e0c8",
  background = "#243742",
}: {
  text: string;
  position: Position;
  width?: number;
  color?: string;
  background?: string;
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 384;
    canvas.height = 96;
    const context = canvas.getContext("2d")!;
    context.fillStyle = background;
    context.fillRect(0, 0, 384, 96);
    context.fillStyle = color;
    context.font = "bold 48px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, 192, 51);
    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    return result;
  }, [text, color, background]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={position}>
      <planeGeometry args={[width, width / 4]} />
      <meshStandardMaterial map={texture} roughness={0.85} />
    </mesh>
  );
}

export function PersonaClothes({ name }: { name: string }) {
  if (name === "Alex")
    return (
      <group name="janitor-workwear">
        <Solid
          position={[0, 1.075, 0.212]}
          size={[0.43, 0.4, 0.045]}
          round={0.04}
          color="#344f60"
        />
        {[-1, 1].map((side) => (
          <group key={side}>
            <Solid
              position={[side * 0.195, 1.29, 0.21]}
              size={[0.063, 0.26, 0.033]}
              color="#344f60"
              round={0.015}
            />
            <Solid
              position={[side * 0.195, 1.195, 0.236]}
              size={[0.054, 0.043, 0.02]}
              color="#b7aa77"
              round={0.008}
            />
          </group>
        ))}
        <Solid
          position={[0, 1.045, 0.244]}
          size={[0.24, 0.135, 0.025]}
          color="#425f70"
          round={0.015}
        />
        <Patch text="ALEX" position={[0, 1.1, 0.259]} width={0.16} />
        <Solid
          position={[-0.235, 0.84, 0.228]}
          rotation={[0, 0, 0.1]}
          size={[0.105, 0.24, 0.035]}
          color="#b6c8ab"
          round={0.012}
        />
        <group position={[0.31, 0.86, 0.02]}>
          <Solid
            position={[0, -0.04, 0]}
            size={[0.105, 0.18, 0.09]}
            color="#73c4b9"
            round={0.025}
          />
          <Solid
            position={[0.015, 0.09, 0.01]}
            size={[0.13, 0.045, 0.07]}
            color="#e2d9bc"
            round={0.012}
          />
          <Solid
            position={[0.025, 0.065, 0.02]}
            size={[0.03, 0.07, 0.022]}
            color="#d1c3a7"
          />
        </group>
      </group>
    );
  if (name === "Jordan")
    return (
      <group name="security-uniform">
        <Solid
          position={[0, 1.08, 0.205]}
          size={[0.48, 0.43, 0.03]}
          color="#1d303e"
          round={0.04}
        />
        <Patch text="SECURITY" position={[0, 1.315, 0.227]} width={0.3} />
        <Patch text="JORDAN" position={[0.13, 1.07, 0.239]} width={0.16} />
        <mesh position={[-0.13, 1.16, 0.241]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.055, 0.045, 0.015, 6]} />
          <meshStandardMaterial
            color="#d5b86c"
            metalness={0.65}
            roughness={0.4}
          />
        </mesh>
        <Solid
          position={[0.3, 0.79, 0.055]}
          size={[0.14, 0.22, 0.14]}
          color="#182731"
          round={0.025}
        />
        <Solid
          position={[-0.31, 0.8, 0.04]}
          size={[0.085, 0.23, 0.1]}
          color="#223846"
          round={0.018}
        />
        <Solid
          position={[0, 1.06, -0.205]}
          size={[0.44, 0.4, 0.035]}
          color="#1d303e"
          round={0.03}
        />
        <group rotation={[0, Math.PI, 0]}>
          <Patch text="SECURITY" position={[0, 1.2, 0.226]} width={0.37} />
        </group>
      </group>
    );
  if (name === "Sam")
    return (
      <group name="contractor-jacket">
        <Solid
          position={[0, 1.13, 0.207]}
          size={[0.15, 0.49, 0.025]}
          color="#d5c9ad"
          round={0.025}
        />
        {[-1, 1].map((side) => (
          <group key={side}>
            <Solid
              position={[side * 0.105, 1.27, 0.229]}
              rotation={[0, 0, side * -0.2]}
              size={[0.09, 0.23, 0.025]}
              color="#5c5144"
              round={0.015}
            />
            <Solid
              position={[side * 0.205, 0.965, 0.207]}
              size={[0.14, 0.055, 0.025]}
              color="#655847"
              round={0.01}
            />
            <Solid
              position={[side * 0.055, 1.17, 0.255]}
              rotation={[0, 0, side * -0.18]}
              size={[0.017, 0.29, 0.014]}
              color="#304e52"
            />
          </group>
        ))}
        <Solid
          position={[0, 0.987, 0.26]}
          size={[0.16, 0.19, 0.019]}
          color="#e5e4d2"
          round={0.012}
        />
        <Patch
          text="E-17"
          position={[0, 1.015, 0.271]}
          width={0.135}
          background="#e5e4d2"
          color="#24444a"
        />
        <Patch
          text="SAM"
          position={[0, 0.96, 0.271]}
          width={0.12}
          background="#e5e4d2"
          color="#24444a"
        />
        <Solid
          position={[0.315, 0.76, -0.005]}
          size={[0.15, 0.23, 0.14]}
          color="#6c4c35"
          round={0.018}
        />
        <Solid
          position={[0.325, 0.87, 0.073]}
          size={[0.024, 0.19, 0.02]}
          color="#b5babb"
          round={0.006}
        />
      </group>
    );
  if (name === "Gabby")
    return (
      <group name="civilian-cardigan-and-bag">
        <Solid
          position={[0, 1.15, 0.207]}
          size={[0.21, 0.46, 0.025]}
          color="#f2e5ce"
          round={0.035}
        />
        {[-1, 1].map((side) => (
          <Solid
            key={side}
            position={[side * 0.135, 1.12, 0.224]}
            size={[0.035, 0.53, 0.018]}
            color="#417e7d"
            round={0.01}
          />
        ))}
        <Solid
          position={[0.015, 1.09, 0.259]}
          rotation={[0, 0, -0.55]}
          size={[0.038, 0.76, 0.025]}
          color="#835438"
          round={0.008}
        />
        <Solid
          position={[-0.31, 0.79, 0.11]}
          size={[0.19, 0.28, 0.2]}
          color="#985f40"
          round={0.055}
        />
        <Solid
          position={[-0.31, 0.845, 0.218]}
          size={[0.17, 0.1, 0.025]}
          color="#ad7653"
          round={0.02}
        />
        <Solid
          position={[-0.31, 0.81, 0.235]}
          size={[0.035, 0.045, 0.012]}
          color="#d0b87d"
          round={0.009}
        />
      </group>
    );
  return null;
}

export function PersonaHead({ name, hair }: { name: string; hair: string }) {
  if (name === "Alex")
    return (
      <group name="alex-close-curls-and-beard">
        {[-1, 0, 1].flatMap((row) =>
          [-1, 0, 1].map((column) => (
            <mesh
              key={`${row}-${column}`}
              position={[
                column * 0.13,
                0.24 - Math.abs(column) * 0.025,
                row * 0.11 - 0.035,
              ]}
              scale={[0.085, 0.065, 0.085]}
              castShadow
            >
              <sphereGeometry args={[1, 8, 6]} />
              <meshStandardMaterial color={hair} roughness={1} />
            </mesh>
          )),
        )}
        <Solid
          position={[0, -0.205, 0.151]}
          size={[0.23, 0.072, 0.056]}
          color={hair}
          round={0.03}
        />
        {[-1, 1].map((side) => (
          <Solid
            key={side}
            position={[side * 0.115, -0.142, 0.161]}
            rotation={[0, side * 0.22, side * -0.4]}
            size={[0.062, 0.13, 0.032]}
            color={hair}
            round={0.02}
          />
        ))}
      </group>
    );
  if (name === "Jordan")
    return (
      <group name="security-cap-and-moustache">
        <mesh
          position={[0, 0.22, -0.02]}
          scale={[0.263, 0.105, 0.24]}
          castShadow
        >
          <sphereGeometry args={[1, 16, 10]} />
          <meshStandardMaterial color="#213543" roughness={0.9} />
        </mesh>
        <Solid
          position={[0, 0.175, 0.24]}
          size={[0.38, 0.028, 0.2]}
          color="#182a34"
          round={0.018}
        />
        <Patch
          text="SECURITY"
          position={[0, 0.245, 0.22]}
          width={0.21}
          background="#213543"
        />
        <Solid
          position={[0, -0.09, 0.231]}
          size={[0.11, 0.032, 0.018]}
          color={hair}
          round={0.012}
        />
        {[-1, 1].map((side) => (
          <Solid
            key={side}
            position={[side * 0.082, -0.015, 0.222]}
            size={[0.061, 0.01, 0.006]}
            color="#a47a60"
            round={0.004}
          />
        ))}
      </group>
    );
  if (name === "Sam")
    return (
      <group name="sam-swept-hair-and-stubble">
        {[-1, 1].map((side) => (
          <Solid
            key={side}
            position={[side * 0.19, -0.016, 0.06]}
            size={[0.035, 0.12, 0.04]}
            color={hair}
            round={0.014}
          />
        ))}
        <Solid
          position={[0, -0.207, 0.154]}
          size={[0.16, 0.025, 0.02]}
          color="#8b755c"
          round={0.01}
        />
        <mesh
          position={[-0.07, 0.237, 0.045]}
          rotation={[0, 0, 0.2]}
          scale={[0.16, 0.075, 0.175]}
          castShadow
        >
          <sphereGeometry args={[1, 12, 8]} />
          <meshStandardMaterial color={hair} roughness={0.9} />
        </mesh>
      </group>
    );
  if (name === "Gabby")
    return (
      <group name="lucia-ponytail-and-earrings">
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * 0.185, 0.025, -0.075]}
            scale={[0.072, 0.22, 0.15]}
            castShadow
          >
            <sphereGeometry args={[1, 12, 10]} />
            <meshStandardMaterial color={hair} roughness={0.85} />
          </mesh>
        ))}
        <mesh
          position={[0.02, -0.01, -0.29]}
          rotation={[-0.18, 0, -0.15]}
          scale={[0.105, 0.27, 0.09]}
          castShadow
        >
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color={hair} roughness={0.85} />
        </mesh>
        <Solid
          position={[0.01, 0.12, -0.265]}
          size={[0.16, 0.04, 0.085]}
          color="#c68d64"
          round={0.015}
        />
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.235, -0.087, 0.015]}>
            <torusGeometry args={[0.031, 0.006, 5, 12]} />
            <meshStandardMaterial
              color="#d7b96a"
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>
        ))}
        <mesh
          position={[0.07, 0.235, 0.035]}
          rotation={[0, 0, -0.25]}
          scale={[0.19, 0.085, 0.2]}
          castShadow
        >
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color={hair} roughness={0.85} />
        </mesh>
      </group>
    );
  return null;
}
