import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { CanvasTexture, LinearFilter, SRGBColorSpace, Vector3, type Group, type MeshStandardMaterial, type PointLight } from 'three'
import { obstacles, suspects } from '../game/case'
import type { Position, Suspect, TargetId } from '../game/types'

function Block({ position, size, color, glow = false, opacity = 1, metal = 0.2 }: { position: Position; size: Position; color: string; glow?: boolean; opacity?: number; metal?: number }) {
  return <mesh position={position} castShadow receiveShadow><boxGeometry args={size} /><meshStandardMaterial color={color} metalness={metal} roughness={glow ? 0.25 : 0.72} emissive={glow ? color : '#000'} emissiveIntensity={glow ? 0.85 : 0} transparent={opacity < 1} opacity={opacity} /></mesh>
}
function Label({ position, children, className = '', fixedSize = false }: { position: Position; children: ReactNode; className?: string; fixedSize?: boolean }) {
  return <Html position={position} center distanceFactor={fixedSize ? undefined : 8} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}><div className={`world-label ${className}`}>{children}</div></Html>
}
function Sign({ position, rotation, width, height, depth = 0.07, board, title, detail, titleColor = '#e8f4ff', detailColor = '#8be6dc', stripe, italic = false }: { position: Position; rotation?: Position; width: number; height: number; depth?: number; board?: string; title: string; detail?: string; titleColor?: string; detailColor?: string; stripe?: string; italic?: boolean }) {
  const map = useMemo(() => {
    const w = 1024, h = Math.max(160, Math.round(1024 * (height / width)))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!
    if (board) {
      ctx.fillStyle = board
      ctx.fillRect(0, 0, w, h)
      if (stripe) { ctx.fillStyle = stripe; ctx.fillRect(0, 0, w, Math.max(10, h * 0.08)) }
    }
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = titleColor
    ctx.font = `${italic ? 'italic ' : ''}700 ${detail ? h * 0.34 : h * 0.42}px Arial, Helvetica, sans-serif`
    ctx.fillText(title, w / 2, detail ? h * 0.4 : h * 0.52, w * 0.9)
    if (detail) {
      ctx.fillStyle = detailColor
      ctx.font = `600 ${h * 0.13}px Arial, Helvetica, sans-serif`
      ctx.fillText(detail, w / 2, h * 0.72, w * 0.9)
    }
    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace
    texture.minFilter = LinearFilter
    return texture
  }, [board, title, detail, titleColor, detailColor, stripe, italic, width, height])
  useEffect(() => () => map.dispose(), [map])
  return <group position={position} rotation={rotation}>
    {board && <mesh castShadow receiveShadow><boxGeometry args={[width, height, depth]} /><meshStandardMaterial color={board} roughness={0.5} metalness={0.15} /></mesh>}
    <mesh position={[0, 0, depth / 2 + 0.006]}><planeGeometry args={[board ? width * 0.92 : width, board ? height * 0.8 : height]} /><meshBasicMaterial map={map} transparent={!board} toneMapped={false} /></mesh>
  </group>
}
const cafeBounds = { x: -4.95, z: 3.15, width: 0.95, depth: 2.15 }
type Speech = { id: TargetId; text: string } | null

function Character({ showLabel, targeted, speech, ...s }: Suspect & { showLabel: boolean; targeted: boolean; speech: Speech }) {
  const body = useRef<Group>(null)
  const echo = s.id === 'echo', nyx = s.id === 'nyx', mara = s.id === 'mara'
  useFrame(({ clock }) => {
    if (!body.current) return
    const t = clock.elapsedTime
    body.current.position.y = echo ? 0.22 + Math.sin(t * 1.4) * 0.06 : Math.sin(t * 1.5 + s.position[0]) * 0.015
    body.current.rotation.y = echo ? Math.sin(t * 0.4) * 0.25 : Math.sin(t * 0.3) * 0.06
  })
  const suit = mara ? '#d5dbe3' : nyx ? '#1a1428' : echo ? '#61ccc9' : '#1c2a38'
  const skin = mara ? '#c4a28a' : '#b78d79'
  return <group position={s.position}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}><ringGeometry args={[0.62, 0.7, 48]} /><meshBasicMaterial color={s.color} transparent opacity={echo ? 0.9 : 0.55} /></mesh>
    {echo && <mesh position={[0, 0.08, 0]}><cylinderGeometry args={[0.55, 0.7, 0.12, 32]} /><meshStandardMaterial color="#10222c" metalness={0.9} roughness={0.2} /></mesh>}
    {echo && <pointLight position={[0, 1.4, 0]} color={s.color} intensity={4.5} distance={5} />}
    <group ref={body}>
      <mesh position={[0, 1.22, 0]}><cylinderGeometry args={[echo ? 0.28 : 0.31, 0.23, 0.78, echo ? 16 : 8]} /><meshStandardMaterial color={suit} transparent={echo} opacity={echo ? 0.42 : 1} emissive={echo ? s.color : nyx ? '#3b1a55' : '#000'} emissiveIntensity={echo ? 0.8 : nyx ? 0.25 : 0} metalness={nyx ? 0.7 : 0.35} roughness={0.4} /></mesh>
      {[-1, 1].map(side => <group key={side}>
        <Block position={[side * 0.14, 0.46, 0]} size={[0.2, 0.8, 0.23]} color={echo ? '#367d85' : nyx ? '#121018' : mara ? '#c5ccd4' : '#151c28'} glow={echo} opacity={echo ? 0.4 : 1} />
        <Block position={[side * 0.39, 1.18, 0]} size={[0.17, 0.67, 0.22]} color={echo ? '#367d85' : nyx ? '#2a1b3d' : mara ? '#eceff3' : '#263340'} glow={echo} opacity={echo ? 0.4 : 1} />
      </group>)}
      {nyx ? <>
        <mesh position={[0, 1.96, 0]}><sphereGeometry args={[0.3, 16, 12]} /><meshStandardMaterial color="#15101c" metalness={0.85} roughness={0.25} /></mesh>
        <Block position={[0, 1.97, 0.22]} size={[0.42, 0.16, 0.06]} color="#cc9cff" glow />
        <Block position={[0, 1.88, 0.26]} size={[0.38, 0.05, 0.03]} color="#74e8e2" glow />
      </> : <>
        <mesh position={[0, 1.93, 0]}><sphereGeometry args={[echo ? 0.24 : 0.26, 16, 12]} /><meshStandardMaterial color={echo ? s.color : skin} transparent={echo} opacity={echo ? 0.45 : 1} emissive={echo ? s.color : '#000'} emissiveIntensity={echo ? 0.7 : 0} /></mesh>
        {mara && <Block position={[0, 2.12, 0]} size={[0.42, 0.1, 0.4]} color="#1a2430" />}
        {!echo && <Block position={[0, 1.96, 0.225]} size={[0.26, 0.035, 0.045]} color="#3e302b" />}
      </>}
      {echo && Array.from({ length: 10 }, (_, i) => <mesh key={i} position={[0, 0.5 + i * 0.14, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.3, 0.005, 4, 24]} /><meshBasicMaterial color="#a5ffff" transparent opacity={0.45} /></mesh>)}
      {!echo && <Block position={[0, 1.34, 0.265]} size={[0.08, 0.29, 0.035]} color={mara ? '#004977' : '#b3313d'} />}
      {!echo && !mara && <Block position={[0, 1.55, 0.28]} size={[0.22, 0.08, 0.04]} color={nyx ? '#cc9cff' : '#eeb477'} glow />}
    </group>
    {speech?.id === s.id && <Html position={[0, echo ? 2.85 : 2.6, 0]} center zIndexRange={[15, 11]} style={{ pointerEvents: 'auto' }}><div className="speech-bubble" role="status" aria-live="polite" aria-atomic="true"><strong>{s.name}</strong><p>{speech.text}</p></div></Html>}
    {showLabel && speech?.id !== s.id && <Label position={[0, echo ? 2.9 : 2.65, 0]} fixedSize className={`npc-label ${targeted ? 'npc-targeted' : ''}`}><span>{s.name}</span><small>{s.role.toLowerCase()}</small></Label>}
  </group>
}

function HoloScreen({ position, title, detail, color = '#74e8e2' }: { position: Position; title: string; detail: string; color?: string }) {
  const mat = useRef<MeshStandardMaterial>(null)
  useFrame(({ clock }) => { if (mat.current) mat.current.emissiveIntensity = Math.sin(clock.elapsedTime * 11 + position[0]) > 0.88 ? 0.15 : 0.9 })
  return <group position={position}>
    <mesh><boxGeometry args={[1.35, 0.82, 0.06]} /><meshStandardMaterial ref={mat} color="#10222c" emissive={color} emissiveIntensity={0.8} /></mesh>
    <Sign position={[0, 0, 0.04]} width={1.22} height={0.62} depth={0.01} title={title} detail={detail} titleColor={color} detailColor="#d7eef2" />
  </group>
}

function Arch({ z, opening }: { z: number; opening: number }) {
  const side = 6 - opening
  return <group>
    <Block position={[-(opening + side / 2), 1.7, z]} size={[side, 3.4, 0.32]} color="#0b1520" metal={0.4} />
    <Block position={[opening + side / 2, 1.7, z]} size={[side, 3.4, 0.32]} color="#0b1520" metal={0.4} />
    <Block position={[0, 3.55, z]} size={[opening * 2 + 0.32, 0.38, 0.38]} color="#163040" />
    <Block position={[0, 3.4, z]} size={[opening * 2, 0.05, 0.4]} color="#83e6df" glow />
  </group>
}

function Vault() {
  return <group position={[0, 0, -10.55]}>
    <Block position={[0, 2.05, 0]} size={[5.4, 4.1, 0.45]} color="#2a3238" metal={0.7} />
    <Block position={[0, 2.05, 0.18]} size={[4.7, 3.55, 0.22]} color="#3d4a52" metal={0.85} />
    <mesh position={[0, 2.1, 0.32]}><cylinderGeometry args={[0.85, 0.85, 0.18, 32]} /><meshStandardMaterial color="#1b2a32" metalness={0.9} roughness={0.2} /></mesh>
    <Block position={[0, 2.1, 0.42]} size={[0.18, 0.18, 0.08]} color="#74e8e2" glow />
    {[-1, 1].map(side => <Block key={side} position={[side * 1.7, 2.05, 0.28]} size={[0.08, 3.2, 0.04]} color="#83e6df" glow />)}
    <Sign position={[0, 3.58, 0.4]} width={3.4} height={0.42} board="#1b2a32" title="VAULT 7 — SEALED" detail="PHYSICAL BREACH: NONE" />
    <Sign position={[0, 1.08, 0.4]} width={2.3} height={0.36} board="#1b2a32" title="LEDGER DISCREPANCY" detail="$80,000,000" titleColor="#ff8a7a" detailColor="#ffd0c8" />
  </group>
}

function Rain() {
  const group = useRef<Group>(null)
  useFrame((_, dt) => {
    group.current?.children.forEach((drop, i) => {
      drop.position.y -= (8 + i % 6) * dt
      if (drop.position.y < 0) drop.position.y = 14
    })
  })
  return <group ref={group}>
    {Array.from({ length: 70 }, (_, i) => <mesh key={i} position={[(i % 12 - 5.5) * 2.1, (i * 1.9) % 14, i % 2 ? 8.6 : -13]}><boxGeometry args={[0.015, 0.45, 0.015]} /><meshBasicMaterial color="#8ec8e6" transparent opacity={0.35} /></mesh>)}
  </group>
}

function Emergency() {
  const a = useRef<PointLight>(null), b = useRef<PointLight>(null)
  useFrame(({ clock }) => {
    const pulse = 8 + Math.sin(clock.elapsedTime * 3.1) * 5
    if (a.current) a.current.intensity = pulse
    if (b.current) b.current.intensity = pulse * 0.85
  })
  return <>
    <pointLight ref={a} position={[0, 3.6, 3.2]} color="#ff4455" distance={18} />
    <pointLight ref={b} position={[0, 3.2, -7]} color="#ff5566" distance={14} />
  </>
}

function Streams() {
  const group = useRef<Group>(null)
  useFrame(({ clock }) => {
    group.current?.children.forEach((node, i) => { node.position.y = ((clock.elapsedTime * (0.6 + i % 4 * 0.2) + i) % 3.6) })
  })
  return <group ref={group}>
    {Array.from({ length: 16 }, (_, i) => <mesh key={i} position={[i % 2 ? 5.72 : -5.72, 0, (i % 8) * 1.4 - 4.5]}><boxGeometry args={[0.03, 0.22, 0.03]} /><meshBasicMaterial color={i % 3 ? '#74e8e2' : '#ff5a5a'} transparent opacity={0.7} /></mesh>)}
  </group>
}

function Cafe() {
  return <group position={[cafeBounds.x, 0, cafeBounds.z]}>
    <Block position={[0, 0.48, 0]} size={[cafeBounds.width, 0.96, cafeBounds.depth]} color="#004977" />
    <Block position={[0, 0.98, 0]} size={[cafeBounds.width + 0.12, 0.1, cafeBounds.depth + 0.12]} color="#efe6d6" />
    {[-0.85, 0.85].map(z => <Block key={z} position={[cafeBounds.width / 2 + 0.02, 1.52, z]} size={[0.045, 1.0, 0.045]} color="#3d4d55" />)}
    <Sign position={[cafeBounds.width / 2 + 0.05, 2.02, 0]} rotation={[0, Math.PI / 2, 0]} width={1.85} height={0.52} depth={0.08} board="#004977" stripe="#bd3544" title="Capital One Café" detail="OPEN 24/7 · EVEN DURING LOCKDOWN" titleColor="#fffaf1" detailColor="#dbe7eb" />
    <Block position={[0.08, 1.36, -0.55]} size={[0.58, 0.64, 0.72]} color="#a3acaa" />
    <Sign position={[cafeBounds.width / 2 + 0.03, 1.38, -0.55]} rotation={[0, Math.PI / 2, 0]} width={0.82} height={0.36} depth={0.04} board="#f8f1e5" title="COFFEE. CONNECTION." detail="CAPITAL ONE." titleColor="#17465f" detailColor="#5f6d68" />
    {[0.2, 0.55, 0.9].map(z => <group key={z} position={[0.2, 1.16, z]}>
      <mesh castShadow><cylinderGeometry args={[0.085, 0.062, 0.22, 20]} /><meshStandardMaterial color="#f7f0e3" roughness={0.8} /></mesh>
      <mesh position={[0, 0.015, 0]}><cylinderGeometry args={[0.088, 0.078, 0.08, 20]} /><meshStandardMaterial color="#004977" /></mesh>
    </group>)}
  </group>
}

function Room({ showLabels, target, speech }: { showLabels: boolean; target: TargetId | null; speech: Speech }) {
  return <>
    <color attach="background" args={['#0a101c']} /><fog attach="fog" args={['#0a101c', 22, 48]} />
    <ambientLight intensity={0.38} color="#5a3340" />
    <hemisphereLight args={['#8a4550', '#121018', 0.7]} />
    <directionalLight position={[-3, 9, 4]} intensity={0.85} color="#c5d8e6" />
    <Emergency />
    <pointLight position={[-2.2, 2.8, 2.4]} color="#74e8e2" intensity={11} distance={8} />
    <pointLight position={[2.5, 2.4, 2.5]} color="#cc9cff" intensity={7} distance={6} />
    <pointLight position={[-2.8, 2.6, -2.4]} color="#eeb477" intensity={9} distance={7} />
    <pointLight position={[0, 3.2, -8]} color="#d7e4ee" intensity={10} distance={11} />
    <Block position={[0, -0.16, -2]} size={[12.2, 0.32, 17.4]} color="#1a222c" />
    <Block position={[0, 0.01, 3]} size={[11.6, 0.02, 6]} color="#2a1820" />
    <Block position={[0, 0.01, -2.2]} size={[11.6, 0.02, 4.4]} color="#182430" />
    <Block position={[0, 0.01, -7.8]} size={[6.8, 0.02, 6.8]} color="#22262c" />
    <Block position={[0, 0.02, 0.3]} size={[1.2, 0.01, 16]} color="#3a2030" />
    {Array.from({ length: 12 }, (_, i) => <Block key={i} position={[0, 0.02, i * 1.4 - 10]} size={[11.8, 0.01, 0.02]} color="#2a3340" />)}
    <Block position={[0, 2.2, 6.05]} size={[12.2, 4.4, 0.22]} color="#0c141c" />
    <mesh position={[0, 2.3, 5.92]}><boxGeometry args={[10.4, 3.2, 0.04]} /><meshStandardMaterial color="#1a3040" transparent opacity={0.18} metalness={0.4} roughness={0.1} /></mesh>
    {[-1, 1].map(side => <group key={side}>
      <Block position={[side * 6.05, 2.2, -2]} size={[0.22, 4.4, 17.4]} color="#0c141c" />
      <mesh position={[side * 5.92, 2.4, 2.6]}><boxGeometry args={[0.04, 3, 5.2]} /><meshStandardMaterial color="#1a3040" transparent opacity={0.16} metalness={0.4} roughness={0.1} /></mesh>
      <Block position={[side * 5.95, 3.9, 2.6]} size={[0.08, 0.06, 5.2]} color="#ff2a2a" glow />
    </group>)}
    <Block position={[0, 4.35, -2]} size={[12.2, 0.18, 17.4]} color="#0a1218" />
    {[-4, 0, 4].map(x => [-6, -1, 3].map(z => <Block key={`${x}-${z}`} position={[x, 4.18, z]} size={[1.4, 0.05, 0.28]} color="#ff2a2a" glow />))}
    <Arch z={0.35} opening={2.05} />
    <Arch z={-4.85} opening={1.75} />
    {[-1, 1].map(side => <Block key={side} position={[side * 3.55, 1.7, -7.7]} size={[0.22, 3.4, 5.8]} color="#0b1520" metal={0.4} />)}
    <Vault />
    <Cafe />
    <pointLight position={[cafeBounds.x + 0.9, 2.1, cafeBounds.z]} color="#ffe6c4" intensity={7} distance={5.5} />
    <Sign position={[0, 3.78, 5.9]} rotation={[0, Math.PI, 0]} width={3.8} height={0.4} board="#10222c" title="NEON LOBBY" detail="NEXUS BRANCH 7 · LOCKDOWN" />
    <Sign position={[0, 3.78, 0.56]} width={3.4} height={0.32} board="#10222c" title="SECURITY HUB" detail="CAMERAS: OFFLINE 00:00:47" />
    <Sign position={[0, 3.78, -4.66]} width={3.2} height={0.32} board="#10222c" title="VAULT CORRIDOR" detail="BIOMETRIC SEAL HOLDING" />
    <HoloScreen position={[-4.6, 2.15, 5.7]} title="CAPITAL ONE" detail="HOLOGRAPHIC TELLER · OFFLINE" />
    <HoloScreen position={[4.6, 2.15, 5.7]} title="TRANSACTION STREAM" detail="LEDGER DESYNC · $80,000,000" color="#ff5a5a" />
    <HoloScreen position={[-2.6, 1.85, -3.55]} title="CAMERA GRID" detail="BLACKOUT · 47 SECONDS" color="#eeb477" />
    <group position={[-4.4, 0, 3.2]}>
      <Block position={[0, 0.45, 0]} size={[1.35, 0.9, 0.7]} color="#10222c" metal={0.6} />
      <Block position={[0, 1.05, 0]} size={[1.05, 0.08, 0.48]} color="#74e8e2" glow opacity={0.5} />
      <Sign position={[0, 1.28, 0.38]} width={1.25} height={0.28} board="#10222c" title="HOLO TELLER" detail="CONCIERGE SUSPENDED" />
    </group>
    <group position={[obstacles[0].x, 0, obstacles[0].z]}>
      <Block position={[0, 0.52, 0]} size={[obstacles[0].width, 1.04, obstacles[0].depth]} color="#15202c" metal={0.5} />
      <Block position={[0, 1.08, 0]} size={[obstacles[0].width + 0.1, 0.08, obstacles[0].depth + 0.08]} color="#1e3140" />
    </group>
    <group position={[obstacles[2].x, 0, obstacles[2].z]}>
      <Block position={[0, 0.22, 0]} size={[0.95, 0.44, 0.7]} color="#1a1428" />
      <Block position={[0, 0.46, 0]} size={[0.7, 0.06, 0.42]} color="#cc9cff" glow />
      <Sign position={[0, 0.64, 0.38]} width={0.88} height={0.2} board="#1a1428" title="COURIER CASE" detail="NEURAL CORE: MISSING" titleColor="#e8d0ff" detailColor="#cc9cff" />
    </group>
    <mesh position={[4.4, 3.1, -7.2]}><sphereGeometry args={[0.18, 12, 10]} /><meshStandardMaterial color="#4a5560" metalness={0.8} /></mesh>
    <Block position={[4.4, 2.85, -7.2]} size={[0.08, 0.35, 0.08]} color="#83e6df" glow />
    <Streams /><Rain />
    {[-1, 1].map(side => <group key={side}>
      {Array.from({ length: 6 }, (_, i) => <group key={i} position={[side * 14, 0, i * 7 - 16]}>
        <Block position={[0, 6, 0]} size={[5, 12 + i % 3 * 3, 5]} color={i % 2 ? '#141c26' : '#101820'} />
        {Array.from({ length: 5 }, (_, j) => <Block key={j} position={[-side * 2.52, 1.4 + j * 2, 0]} size={[0.04, 0.9, 3.6]} color="#2a4a5a" glow={j === 2} />)}
      </group>)}
    </group>)}
    {suspects.map(s => <Character key={s.id} {...s} showLabel={showLabels} speech={speech} targeted={target === s.id} />)}
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
    const down = (e: KeyboardEvent) => { if (!(e.target instanceof HTMLInputElement) && document.pointerLockElement === gl.domElement) keys.current.add(e.code) }
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
      const blocked = (x: number, z: number) => {
        if (z > 5.55 || z < -10.15) return true
        if (z > -4.85 && Math.abs(x) > 5.7) return true
        if (z <= -4.85 && Math.abs(x) > 3.22) return true
        if (Math.abs(z - 0.35) < 0.28 && Math.abs(x) > 2.05) return true
        if (Math.abs(z + 4.85) < 0.28 && Math.abs(x) > 1.75) return true
        return (Math.abs(x - cafeBounds.x) < cafeBounds.width / 2 + 0.28 && Math.abs(z - cafeBounds.z) < cafeBounds.depth / 2 + 0.28) || obstacles.some(o => Math.abs(x - o.x) < o.width / 2 + 0.28 && Math.abs(z - o.z) < o.depth / 2 + 0.28) || suspects.some(s => Math.hypot(x - s.position[0], z - s.position[2]) < 0.65)
      }
      if (!blocked(camera.position.x + dx, camera.position.z)) camera.position.x += dx
      if (!blocked(camera.position.x, camera.position.z + dz)) camera.position.z += dz
    }
    camera.getWorldDirection(direction.current)
    let next: TargetId | null = null
    let closest = 3.1
    for (const object of suspects) {
      const p = object.position
      deltaVector.current.set(p[0], 1.5, p[2]).sub(camera.position)
      const distance = deltaVector.current.length()
      if (distance < closest && deltaVector.current.normalize().dot(direction.current) > 0.9) { closest = distance; next = object.id }
    }
    if (next !== previous.current) { previous.current = next; onTarget(next) }
  })
  return null
}

export default function World({ active, target, speech, onTarget, onLock }: { speech: Speech; active: boolean; target: TargetId | null; onTarget: (id: TargetId | null) => void; onLock: (locked: boolean) => void }) {
  return <Canvas shadows dpr={[1, 1.5]} camera={{ position: [-2.4, 1.7, 3.15], rotation: [0, Math.PI / 2, 0], fov: 65 }} gl={{ antialias: true }}><Room showLabels={active} target={target} speech={speech} /><Player active={active} onTarget={onTarget} onLock={onLock} /></Canvas>
}
