import { art, BrandPanel, Cylinder, Plant, Sign, Solid } from "./ArtPrimitives";

function Camera({
  x,
  z,
  damaged = false,
}: {
  x: number;
  z: number;
  damaged?: boolean;
}) {
  return (
    <group
      position={[x, 4.1, z]}
      rotation={[
        damaged ? 0.45 : 0.12,
        x < 0 ? -0.45 : 0.45,
        damaged ? -0.55 : 0,
      ]}
    >
      <Solid
        position={[0, 0.1, -0.18]}
        size={[0.08, 0.3, 0.3]}
        color={art.steel}
        metal={0.8}
      />
      <Solid
        position={[0, 0, 0.1]}
        size={[0.28, 0.22, 0.52]}
        color="#c1c9c2"
        metal={0.6}
        round={0.04}
      />
      <Cylinder
        position={[0, 0, 0.38]}
        radius={0.087}
        height={0.04}
        color="#132b39"
        rough={0.1}
        rotation={[Math.PI / 2, 0, 0]}
      />
      <Solid
        position={[0.1, 0.05, 0.385]}
        size={[0.024, 0.022, 0.014]}
        color={damaged ? "#e17863" : "#76c8b2"}
        glow={1.5}
      />
    </group>
  );
}

function Vault() {
  return (
    <group name="breached-vault">
      <Solid
        position={[0, 4.6, -11]}
        size={[6, 1.2, 0.6]}
        color="#223a45"
        metal={0.7}
      />
      <Sign
        position={[0, 4.63, -10.68]}
        title="VAULT  /  01"
        subtitle="SECURITY SEAL COMPROMISED"
        width={4.8}
        height={0.8}
        color="#deb79e"
      />
      {[-3.05, 3.05].map((x) => (
        <Solid
          key={x}
          position={[x, 2.1, -10.7]}
          size={[0.3, 4.2, 0.35]}
          color="#92a3a5"
          metal={0.88}
          rough={0.25}
        />
      ))}
      <Solid
        position={[0, 4.13, -10.7]}
        size={[6.3, 0.24, 0.35]}
        color="#92a3a5"
        metal={0.88}
        rough={0.25}
      />
      <Solid
        position={[0, 0.02, -12.75]}
        size={[5.5, 0.04, 3.6]}
        color="#344c56"
        rough={0.35}
        metal={0.45}
      />
      <Cylinder
        position={[3.1, 2.05, -12.3]}
        radius={1.65}
        height={0.52}
        color="#526976"
        metal={0.85}
        rough={0.29}
        rotation={[0, 0, Math.PI / 2]}
      />
      <Cylinder
        position={[2.81, 2.05, -12.3]}
        radius={1.45}
        height={0.045}
        color="#96a6a4"
        metal={0.93}
        rough={0.26}
        rotation={[0, 0, Math.PI / 2]}
      />
      <mesh position={[2.775, 2.05, -12.3]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[1.43, 0.065, 8, 48]} />
        <meshStandardMaterial
          color="#bac6bd"
          metalness={0.95}
          roughness={0.23}
        />
      </mesh>
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return (
          <Cylinder
            key={i}
            position={[
              2.746,
              2.05 + Math.sin(a) * 1.28,
              -12.3 + Math.cos(a) * 1.28,
            ]}
            radius={0.055}
            height={0.035}
            color="#29434f"
            metal={0.9}
            rotation={[0, 0, Math.PI / 2]}
          />
        );
      })}
      <group position={[2.64, 2.05, -12.3]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <torusGeometry args={[0.49, 0.046, 10, 32]} />
          <meshStandardMaterial
            color="#4a646f"
            metalness={0.95}
            roughness={0.2}
          />
        </mesh>
        {[0, 1, 2].map((i) => (
          <Cylinder
            key={i}
            position={[0, 0, 0]}
            radius={0.028}
            height={0.94}
            color="#5b7680"
            metal={0.95}
            rotation={[0, 0, (i * Math.PI) / 3]}
          />
        ))}
        <Cylinder
          position={[0, 0, 0]}
          radius={0.11}
          height={0.22}
          color="#91a7a8"
          metal={0.95}
          rotation={[Math.PI / 2, 0, 0]}
        />
      </group>
      {[0.85, 3.15].map((y) => (
        <Cylinder
          key={y}
          position={[3.25, y, -10.75]}
          radius={0.18}
          height={0.55}
          color="#87999b"
          metal={0.86}
        />
      ))}
      <Solid
        position={[0, 2, -14.74]}
        size={[5, 3.7, 0.05]}
        color="#162d39"
        metal={0.6}
      />
      {[-2, -1, 0, 1, 2].flatMap((x) =>
        [0.65, 1.45, 2.25, 3.05].map((y, row) => (
          <group key={`${x}-${y}`}>
            <Solid
              position={[x, y, -14.61]}
              size={[0.93, 0.71, 0.15]}
              color={row % 2 ? "#70858b" : "#829592"}
              metal={0.8}
              rough={0.37}
              round={0.016}
            />
            <Solid
              position={[x + 0.21, y, -14.516]}
              size={[0.15, 0.055, 0.06]}
              color="#c0c7b7"
              metal={0.95}
              round={0.017}
            />
            <Cylinder
              position={[x - 0.22, y - 0.02, -14.52]}
              radius={0.021}
              height={0.013}
              color={art.ink}
              rotation={[Math.PI / 2, 0, 0]}
            />
          </group>
        )),
      )}
      <Solid
        position={[2.25, 4.4, -10.64]}
        size={[0.12, 0.12, 0.06]}
        color="#e58369"
        glow={1.3}
        round={0.03}
      />
      <pointLight
        position={[0, 3.5, -12.5]}
        color="#c9bb9d"
        intensity={20}
        distance={9}
        decay={2}
      />
    </group>
  );
}

export default function BankDetails() {
  return (
    <group name="capital-one-central-bank">
      <Solid
        position={[0, 0.017, 4]}
        size={[4.7, 0.034, 9.5]}
        color="#25484e"
        rough={0.9}
      />
      <Solid
        position={[0, 6.85, -3]}
        size={[24.7, 0.3, 24.6]}
        color="#1b303b"
      />
      <Solid
        position={[0, 8.45, 8.7]}
        size={[25.4, 3.3, 1.2]}
        color="#566c77"
        texture="stone"
        metal={0.32}
      />
      <Solid
        position={[0, 10.22, 8.7]}
        size={[26, 0.3, 1.6]}
        color="#142b38"
        metal={0.8}
        rough={0.3}
      />
      <Solid
        position={[0, 6.5, 10.15]}
        size={[25.5, 0.3, 2.8]}
        color="#29434e"
        metal={0.8}
      />
      <Solid
        position={[0, 6.32, 11.57]}
        size={[25.2, 0.045, 0.06]}
        color="#a8d0d5"
        glow={2}
      />
      <Solid
        position={[0, 5.7, 9]}
        size={[5.3, 2.2, 0.5]}
        color="#28434f"
        metal={0.5}
      />
      <Sign
        position={[0, 8.58, 9.32]}
        title="CAPITAL ONE"
        subtitle="FINANCIAL DISTRICT  /  CENTRAL BRANCH"
        width={15}
        height={1.45}
        background="#233b47"
        color="#c4d2c9"
      />
      <Sign
        position={[0, 5.25, 9.32]}
        title="INVESTIGATION IN PROGRESS"
        subtitle="DETECTIVE ACCESS  /  MAIN ENTRANCE"
        width={4.7}
        height={0.75}
        color="#dbb28b"
      />
      {[-10.4, -3.15, 3.15, 10.4].map((x) => (
        <group key={x}>
          <Solid
            position={[x, 3.1, 9.48]}
            size={[0.75, 6.2, 0.95]}
            color="#7d9298"
            texture="stone"
          />
          <Solid
            position={[x, 0.15, 9.6]}
            size={[1, 0.3, 1.1]}
            color="#4e636a"
            metal={0.4}
          />
          <Solid
            position={[x - 0.25, 3.1, 10]}
            size={[0.035, 5.9, 0.022]}
            color={art.brass}
            metal={0.9}
          />
          {[1.6, 3.2, 4.8].map((y) => (
            <Solid
              key={y}
              position={[x, y, 9.969]}
              size={[0.75, 0.025, 0.025]}
              color="#344e59"
              shadow={false}
            />
          ))}
        </group>
      ))}
      {[-6.75, 6.75].map((x) => (
        <group key={x}>
          <Solid
            position={[x, 3, 9.28]}
            size={[5.75, 4.5, 0.03]}
            color="#234454"
            metal={0.82}
            rough={0.2}
          />
          {[-2.15, -0.72, 0.72, 2.15].map((dx) => (
            <Solid
              key={dx}
              position={[x + dx, 3, 9.33]}
              size={[0.055, 4.5, 0.1]}
              color="#819495"
              metal={0.85}
            />
          ))}
          {[1.5, 3, 4.5].map((y) => (
            <Solid
              key={y}
              position={[x, y, 9.34]}
              size={[5.75, 0.05, 0.08]}
              color="#819495"
              metal={0.85}
            />
          ))}
          <Solid
            position={[x, 0.6, 9.55]}
            size={[5.95, 0.1, 0.55]}
            color="#667d85"
            metal={0.45}
          />
        </group>
      ))}
      <Solid
        position={[0, 12.1, -2]}
        size={[15.5, 10.2, 13]}
        color="#19313f"
        metal={0.6}
        rough={0.34}
      />
      {[-6, -3, 0, 3, 6].flatMap((x) =>
        [9.6, 12, 14.4].map((y) => (
          <group key={`${x}-${y}`}>
            <Solid
              position={[x, y, 4.53]}
              size={[2.5, 1.9, 0.04]}
              color={(x + y) % 3 > 1 ? "#597a83" : "#305262"}
              metal={0.8}
              rough={0.22}
              glow={0.12}
            />
            <Solid
              position={[x, y, 4.58]}
              size={[0.04, 1.9, 0.08]}
              color="#758b8f"
              metal={0.8}
            />
          </group>
        )),
      )}
      <Solid
        position={[0, 17.35, -2]}
        size={[16.2, 0.35, 13.6]}
        color="#4c6670"
        metal={0.7}
      />
      <Solid
        position={[0, 17.57, 4.75]}
        size={[16, 0.05, 0.06]}
        color="#9cc7ce"
        glow={1.6}
      />
      {[-4.8, 4.8].map((x) => (
        <Solid
          key={x}
          position={[x, 18.7, 7.7]}
          size={[0.25, 3, 0.45]}
          color="#365263"
          metal={0.85}
        />
      ))}
      <BrandPanel position={[0, 20.1, 8.1]} width={13} />
      <Camera x={-3.45} z={9.85} />
      <Camera x={3.45} z={9.85} damaged />
      {[-9, 9].map((x) => (
        <group key={x}>
          <Solid
            position={[x, 5.9, -3]}
            size={[0.055, 0.045, 19]}
            color="#c3dfe0"
            glow={1.8}
          />
          <pointLight
            position={[x * 0.7, 4.2, -3]}
            color="#aecddc"
            intensity={36}
            distance={18}
            decay={2}
          />
        </group>
      ))}
      {[-10.6, 10.6].map((x) => (
        <group key={x}>
          <Solid
            position={[x, 0.4, -2]}
            size={[1.5, 0.24, 3.4]}
            round={0.11}
            color="#546e74"
            rough={0.9}
          />
          <Solid
            position={[x + Math.sign(x) * 0.57, 0.87, -2]}
            size={[0.22, 0.75, 3.4]}
            round={0.1}
            color="#546e74"
            rough={0.9}
          />
          {[-3.1, -1, -2].map((z) => (
            <Solid
              key={z}
              position={[x, 0.56, z]}
              size={[1.28, 0.13, 0.9]}
              round={0.06}
              color="#6c8587"
              rough={0.96}
            />
          ))}
          <Plant position={[x, 0, 6.7]} scale={1.3} />
        </group>
      ))}
      {[-3.15, 3.15].map((x) => (
        <group key={x}>
          {[1, 3.5].map((z) => (
            <group key={z}>
              <Cylinder
                position={[x, 0.055, z]}
                radius={0.25}
                height={0.11}
                color="#596f77"
                metal={0.85}
              />
              <Cylinder
                position={[x, 0.55, z]}
                radius={0.035}
                height={1.02}
                color="#899d9e"
                metal={0.95}
              />
              <Cylinder
                position={[x, 1.07, z]}
                radius={0.07}
                height={0.09}
                color={art.ink}
              />
            </group>
          ))}
          <Solid
            position={[x, 1.05, 2.25]}
            size={[0.035, 0.07, 2.5]}
            color="#496a71"
          />
        </group>
      ))}
      <Sign
        position={[-6.3, 3.3, -10.75]}
        title="CLIENT SERVICES"
        subtitle="01  /  ACCOUNTS & TRANSACTIONS"
        width={5.8}
        height={0.95}
      />
      <Sign
        position={[6.3, 3.3, -10.75]}
        title="SECURITY OFFICE"
        subtitle="02  /  ACCESS & SURVEILLANCE"
        width={5.8}
        height={0.95}
      />
      <Vault />
      {[
        [-2, 0.043, -9.4],
        [-2.5, 0.046, -9.8],
        [2.4, 0.043, -9.1],
      ].map((position, i) => (
        <Solid
          key={i}
          position={position as [number, number, number]}
          size={[0.23, 0.006, 0.34]}
          color="#bbbba8"
          rotation={[0, i * 0.76, 0]}
          shadow={false}
        />
      ))}
      <Sign
        position={[0, 3.65, 8.71]}
        title="BANK PLAZA  /  EXIT"
        width={4.2}
        height={0.5}
        rotation={Math.PI}
      />
    </group>
  );
}
