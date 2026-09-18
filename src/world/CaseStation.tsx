import { Cylinder, Sign, Solid, art } from "./ArtPrimitives";
import { caseStation } from "./caseSubmissionLocation";

export default function CaseStation({
  focused,
  solved,
}: {
  focused: boolean;
  solved: boolean;
}) {
  const color = focused || solved ? "#dcf697" : "#9fded9";
  return (
    <group position={[caseStation.position[0], 0, caseStation.position[2]]}>
      <Solid
        position={[0, 0.08, 0]}
        size={[1.15, 0.16, 0.65]}
        color={art.steel}
        round={0.06}
      />
      <Solid
        position={[0, 0.65, -0.06]}
        size={[0.55, 1.2, 0.4]}
        color="#223c48"
        round={0.05}
      />
      <Solid
        position={[0, 1.5, 0]}
        size={[1.15, 0.8, 0.2]}
        color="#304c58"
        round={0.05}
      />
      <Sign
        position={[0, 1.55, 0.105]}
        title={solved ? "CASE CLOSED" : "SUBMIT CASE"}
        subtitle={solved ? "REVIEW FINAL REPORT" : "CHOOSE A SUSPECT"}
        width={1.04}
        height={0.58}
        color={color}
        background="#102b32"
        border
      />
      <Solid
        position={[0, 1.055, 0.17]}
        size={[1.02, 0.1, 0.48]}
        color="#476069"
        round={0.04}
      />
      <Cylinder
        position={[0, 1.13, 0.22]}
        radius={0.13}
        height={0.06}
        color={color}
        glow={focused ? 1.4 : 0.6}
      />
      <Sign
        position={[0, 2.15, 0.08]}
        title="CASE SUBMISSION"
        width={1.85}
        height={0.3}
        color="#e3cc99"
        background="#183440"
      />
      <Solid
        position={[0, 1.97, -0.01]}
        size={[0.04, 0.32, 0.06]}
        color={art.brass}
      />
      <Sign
        position={[0, 0.72, 0.15]}
        title="DETECTIVE"
        subtitle="FINAL REVIEW"
        width={0.45}
        height={0.3}
        color="#abbdbd"
        background="#223c48"
      />
    </group>
  );
}
