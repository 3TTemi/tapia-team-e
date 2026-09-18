import { worldFloors, worldStructures, type Surface } from "./layout";
import { art, Cylinder, Floor, Solid } from "./ArtPrimitives";
import CafeDetails from "./CafeDetails";
import BankDetails from "./BankDetails";
import PlazaDetails from "./PlazaDetails";
import CinematicAtmosphere from "./CinematicAtmosphere";

export const environmentPalette: Record<Surface, string> = {
  stone: "#526b79",
  trim: "#243f4e",
  wood: "#926844",
  cream: "#b8ad94",
  glass: "#91bac5",
  seat: "#3b6268",
};

// Detailed furniture renders from the same footprint locations. These volumes
// remain in layout.ts for collision but are not also drawn as solid proxy boxes.
const customGeometry =
  /^(coffee-|cafe-(table|seat|lounge|atm)|planter-|barrier-|police-car|column-|vault-open-door|lobby-seat-|queue-|street-bench-|bollard-|street-lamp-)/;

export default function CityEnvironment() {
  return (
    <>
      <CinematicAtmosphere />
      <Solid position={[0, -0.45, 10]} size={[180, 0.4, 180]} color={art.ink} />
      {worldFloors.map((floor) => (
        <Floor
          key={floor.id}
          {...floor}
          kind={
            floor.id === "cafe"
              ? "wood"
              : floor.id === "bank"
                ? "stone"
                : "paving"
          }
          color={
            { cafe: "#a4825b", bank: "#9ba9a4", plaza: "#718789" }[floor.id]
          }
        />
      ))}
      {worldStructures
        .filter((part) => !customGeometry.test(part.id))
        .map((part) =>
          part.surface === "glass" ? (
            <mesh key={part.id} position={[part.x, part.height / 2, part.z]}>
              <boxGeometry args={[part.width, part.height, part.depth]} />
              <meshPhysicalMaterial
                color={environmentPalette.glass}
                metalness={0.18}
                roughness={0.1}
                transparent
                opacity={0.09}
                depthWrite={false}
              />
            </mesh>
          ) : (
            <Solid
              key={part.id}
              position={[part.x, part.height / 2, part.z]}
              size={[part.width, part.height, part.depth]}
              color={environmentPalette[part.surface]}
              texture={part.surface === "stone" ? "stone" : undefined}
              metal={part.surface === "trim" ? 0.55 : 0.18}
            />
          ),
        )}
      {worldStructures
        .filter((part) => part.id.startsWith("column-"))
        .map((part) => (
          <group key={part.id}>
            <Cylinder
              position={[part.x, 3.4, part.z]}
              radius={0.32}
              height={6.8}
              color="#a1b3b2"
              rough={0.48}
            />
            <Cylinder
              position={[part.x, 0.11, part.z]}
              radius={0.34}
              height={0.22}
              color="#405c68"
              metal={0.8}
            />
            <Cylinder
              position={[part.x, 5.7, part.z]}
              radius={0.33}
              height={0.045}
              color="#b2d2d3"
              glow={1.2}
            />
          </group>
        ))}
      <CafeDetails />
      <PlazaDetails />
      <BankDetails />
    </>
  );
}
