import { useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Vector3, type Group } from 'three'
import { clues, obstacles, suspects } from '../game/case'
import type { ClueId, Position, TargetId } from '../game/types'

function Block({ position, size, color, glow = false }: { position: Position; size: Position; color: string; glow?: boolean }) {
  return <mesh position={position} castShadow receiveShadow>
    <boxGeometry args={size} />
    <meshStandardMaterial color={color} roughness={0.8} emissive={glow ? color : '#000000'} emissiveIntensity={glow ? 1.2 : 0} />
  </mesh>
}

function Label({ position, children, className = '' }: { position: Position; children: React.ReactNode; className?: string }) {
  return <Html position={position} center distanceFactor={8} style={{ pointerEvents: 'none' }}><div className={`world-label ${className}`}>{children}</div></Html>
}

function Hacker({ position, color, name, role }: { position: Position; color: string; name: string; role: string }) {
  const group = useRef<Group>(null)
  useFrame(({ clock }) => { if (group.current) group.current.position.y = Math.sin(clock.elapsedTime * 1.8 + position[0]) * 0.025 })
  return <group position={position}>
    <group ref={group}>
      <Block position={[-0.18, 0.35, 0]} size={[0.29, 0.7, 0.36]} color="#263244" />
      <Block position={[0.18, 0.35, 0]} size={[0.29, 0.7, 0.36]} color="#263244" />
      <Block position={[-0.18, 0.09, 0.08]} size={[0.32, 0.18, 0.5]} color="#e3e4d9" />
      <Block position={[0.18, 0.09, 0.08]} size={[0.32, 0.18, 0.5]} color="#e3e4d9" />
      <Block position={[0, 1.05, 0]} size={[0.73, 0.73, 0.4]} color={color} />
      <Block position={[-0.49, 1, 0]} size={[0.23, 0.72, 0.35]} color={color} />
      <Block position={[0.49, 1, 0]} size={[0.23, 0.72, 0.35]} color={color} />
      <Block position={[0, 1.7, 0]} size={[0.61, 0.61, 0.58]} color={name === 'Alex' ? '#a46b4f' : '#d9a47e'} />
      <Block position={[0, 2.01, -0.025]} size={[0.65, 0.16, 0.63]} color="#272731" />
      <Block position={[-0.15, 1.73, 0.3]} size={[0.075, 0.08, 0.025]} color="#172127" />
      <Block position={[0.15, 1.73, 0.3]} size={[0.075, 0.08, 0.025]} color="#172127" />
      <Block position={[0, 1.16, 0.21]} size={[0.13, 0.2, 0.03]} color="#f3eed7" />
    </group>
    <Label position={[0, 2.55, 0]}><span style={{ color }}>{name}</span><small>{role}</small></Label>
  </group>
}

function Desk({ x, z, width, depth }: typeof obstacles[number]) {
  return <group position={[x, 0, z]}>
    <Block position={[0, 0.94, 0]} size={[width, 0.16, depth]} color="#9b7152" />
    {[-1, 1].flatMap(a => [-1, 1].map(b => <Block key={`${a}${b}`} position={[a * (width / 2 - 0.15), 0.45, b * (depth / 2 - 0.12)]} size={[0.13, 0.9, 0.13]} color="#344241" />))}
  </group>
}

function Monitor({ position, color = '#78dcb3' }: { position: Position; color?: string }) {
  return <group position={position}>
    <Block position={[0, 0.26, 0]} size={[0.9, 0.57, 0.09]} color="#172529" />
    <Block position={[0, 0.26, 0.055]} size={[0.79, 0.45, 0.015]} color="#183b3c" glow />
    {[0, 1, 2].map(i => <Block key={i} position={[-0.1, 0.36 - i * 0.1, 0.07]} size={[0.42 - i * 0.07, 0.025, 0.01]} color={color} glow />)}
    <Block position={[0, -0.09, 0]} size={[0.12, 0.2, 0.12]} color="#263d3c" />
    <Block position={[0, -0.18, 0.1]} size={[0.55, 0.05, 0.32]} color="#263d3c" />
  </group>
}

function Room({ collected, target }: { collected: ClueId[]; target: TargetId | null }) {
  return <>
    <color attach="background" args={['#122526']} />
    <fog attach="fog" args={['#122526', 14, 32]} />
    <ambientLight intensity={0.7} color="#b9d9d6" />
    <hemisphereLight args={['#badcd1', '#4b3b30', 1.3]} />
    <directionalLight position={[3, 9, 4]} intensity={2} color="#ffe1b0" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} />
    <pointLight position={[-4, 3, -4]} color="#a395ff" intensity={12} distance={9} />
    <pointLight position={[4, 3, -5]} color="#72e9b2" intensity={10} distance={9} />
    <Block position={[0, -0.15, 0]} size={[16, 0.3, 18]} color="#35443e" />
    {Array.from({ length: 17 }, (_, i) => <Block key={i} position={[0, 0.004, i - 8]} size={[16, 0.008, 0.022]} color="#526154" />)}
    {Array.from({ length: 15 }, (_, i) => <Block key={i} position={[i - 7, 0.005, 0]} size={[0.018, 0.009, 18]} color="#46574c" />)}
    <Block position={[0, 2.2, -9]} size={[16, 4.4, 0.25]} color="#223836" />
    <Block position={[-8, 2.2, 0]} size={[0.25, 4.4, 18]} color="#29413f" />
    <Block position={[8, 2.2, 0]} size={[0.25, 4.4, 18]} color="#29413f" />
    <Block position={[0, 2.2, 9]} size={[16, 4.4, 0.25]} color="#223836" />
    <Block position={[0, 0.08, -8.8]} size={[15.8, 0.16, 0.09]} color="#91c3a1" glow />
    <Block position={[0, 3.9, -8.8]} size={[15.8, 0.08, 0.09]} color="#c1dab1" glow />
    <Block position={[0, 2.3, -8.78]} size={[2.35, 3.1, 0.12]} color="#111f22" />
    <Block position={[0.8, 1.6, -8.67]} size={[0.12, 0.12, 0.08]} color="#acd9ac" glow />
    <Label position={[0, 3.45, -8.55]} className="room-sign">REPAIR ROOM <small>AUTHORIZED PERSONNEL</small></Label>
    <Label position={[-4.5, 3.35, -8.7]} className="banner">TAPIA<span>AFTER HOURS</span><small>BUILD SOMETHING THAT MATTERS.</small></Label>
    <Label position={[4.8, 3.35, -8.7]} className="room-sign">23:47<small>JUDGING STARTS AT MIDNIGHT</small></Label>
    {[-5, 0, 5].map(z => <group key={z}>
      <Block position={[-7.83, 2.7, z]} size={[0.08, 1.7, 2.8]} color="#0c202b" />
      <Block position={[-7.76, 2.7, z]} size={[0.06, 1.7, 0.08]} color="#55706d" />
      <Block position={[7.83, 2.7, z]} size={[0.08, 1.7, 2.8]} color="#0c202b" />
      <Block position={[7.76, 2.7, z]} size={[0.06, 0.08, 2.8]} color="#55706d" />
    </group>)}
    {obstacles.map((desk, i) => <Desk key={i} {...desk} />)}
    <Monitor position={[-5.3, 1.23, -4.7]} color="#e7a0aa" />
    <Monitor position={[4, 1.23, -4.7]} />
    <Monitor position={[-5.8, 1.23, 2.2]} color="#f2c177" />
    <Block position={[-3.6, 1.06, -4.5]} size={[0.78, 0.09, 0.62]} color="#292f36" />
    <Block position={[-3.6, 1.11, -4.5]} size={[0.56, 0.02, 0.4]} color="#bc9876" />
    <Label position={[-3.6, 1.5, -4.5]} className="missing-label">SPARKY // OFFLINE</Label>
    <Block position={[5.2, 1.04, -4.5]} size={[0.5, 0.035, 0.42]} color="#ede4cf" />
    <Block position={[5.2, 1.064, -4.5]} size={[0.37, 0.015, 0.27]} color="#779884" />
    <Block position={[0, 1.04, -7.8]} size={[0.38, 0.035, 0.52]} color="#e3d4b7" />
    {[[-6.9, -7], [6.8, 4.8]].map(([x, z]) => <group key={x}>
      <Block position={[x, 0.28, z]} size={[0.65, 0.56, 0.65]} color="#ab7960" />
      <Block position={[x, 0.95, z]} size={[0.75, 0.9, 0.7]} color="#557b53" />
      <Block position={[x + 0.2, 1.35, z]} size={[0.6, 0.5, 0.55]} color="#789956" />
    </group>)}
    <Block position={[4.2, 1.06, -4]} size={[0.25, 0.15, 0.25]} color="#e1a366" />
    <Block position={[-4.3, 1.13, -4]} size={[0.15, 0.3, 0.15]} color="#b784a7" />
    {suspects.map(s => <Hacker key={s.id} {...s} />)}
    {clues.map(c => <group key={c.id} position={[c.position[0], c.position[1] + 0.35, c.position[2]]}>
      {!collected.includes(c.id) && <mesh rotation={[0, Math.PI / 4, Math.PI / 4]} scale={target === c.id ? 1.4 : 1}>
        <boxGeometry args={[0.09, 0.09, 0.09]} /><meshBasicMaterial color="#f1cc79" />
      </mesh>}
    </group>)}
  </>
}

function Player({ active, onTarget, onLock }: { active: boolean; onTarget: (id: TargetId | null) => void; onLock: (locked: boolean) => void }) {
  const { camera, gl } = useThree()
  const keys = useRef(new Set<string>())
  const previous = useRef<TargetId | null>(null)
  const direction = useRef(new Vector3())
  const deltaVector = useRef(new Vector3())
  useEffect(() => {
    camera.rotation.order = 'YXZ'
    const down = (e: KeyboardEvent) => { if (document.pointerLockElement === gl.domElement) keys.current.add(e.code) }
    const up = (e: KeyboardEvent) => keys.current.delete(e.code)
    const clear = () => keys.current.clear()
    const lock = () => { clear(); onLock(document.pointerLockElement === gl.domElement) }
    const move = (e: MouseEvent) => {
      if (!active || document.pointerLockElement !== gl.domElement) return
      camera.rotation.y -= e.movementX * 0.002
      camera.rotation.x = Math.max(-1.3, Math.min(1.3, camera.rotation.x - e.movementY * 0.002))
    }
    window.addEventListener('keydown', down); window.addEventListener('keyup', up)
    window.addEventListener('blur', clear); document.addEventListener('pointerlockchange', lock)
    document.addEventListener('mousemove', move)
    return () => {
      window.removeEventListener('keydown', down); window.removeEventListener('keyup', up)
      window.removeEventListener('blur', clear); document.removeEventListener('pointerlockchange', lock)
      document.removeEventListener('mousemove', move)
    }
  }, [active, camera, gl, onLock])
  useFrame((_, dt) => {
    if (active && document.pointerLockElement === gl.domElement) {
      const forward = Number(keys.current.has('KeyW') || keys.current.has('ArrowUp')) - Number(keys.current.has('KeyS') || keys.current.has('ArrowDown'))
      const side = Number(keys.current.has('KeyD') || keys.current.has('ArrowRight')) - Number(keys.current.has('KeyA') || keys.current.has('ArrowLeft'))
      const yaw = camera.rotation.y
      const speed = Math.min(dt, 0.04) * 3.6 / Math.max(1, Math.hypot(forward, side))
      const dx = (-Math.sin(yaw) * forward + Math.cos(yaw) * side) * speed
      const dz = (-Math.cos(yaw) * forward - Math.sin(yaw) * side) * speed
      const blocked = (x: number, z: number) => Math.abs(x) > 7.55 || Math.abs(z) > 8.5 || obstacles.some(o => Math.abs(x - o.x) < o.width / 2 + 0.28 && Math.abs(z - o.z) < o.depth / 2 + 0.28) || suspects.some(s => Math.hypot(x - s.position[0], z - s.position[2]) < 0.65)
      if (!blocked(camera.position.x + dx, camera.position.z)) camera.position.x += dx
      if (!blocked(camera.position.x, camera.position.z + dz)) camera.position.z += dz
    }
    camera.getWorldDirection(direction.current)
    let next: TargetId | null = null
    let closest = 3.1
    for (const object of [...suspects, ...clues]) {
      const p = object.position
      deltaVector.current.set(p[0], 'role' in object ? 1.5 : p[1], p[2]).sub(camera.position)
      const distance = deltaVector.current.length()
      if (distance < closest && deltaVector.current.normalize().dot(direction.current) > 0.9) { closest = distance; next = object.id }
    }
    if (next !== previous.current) { previous.current = next; onTarget(next) }
  })
  return null
}

export default function World({ active, collected, target, onTarget, onLock }: { active: boolean; collected: ClueId[]; target: TargetId | null; onTarget: (id: TargetId | null) => void; onLock: (locked: boolean) => void }) {
  return <Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 1.7, 6.8], fov: 65 }} gl={{ antialias: true }}>
    <Room collected={collected} target={target} />
    <Player active={active} onTarget={onTarget} onLock={onLock} />
  </Canvas>
}
