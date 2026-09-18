export type SuspectId = 'mara' | 'jax' | 'nyx' | 'echo'
export type BystanderId = 'reed' | 'soren' | 'kira' | 'jules'
export type ClueId = 'blackout' | 'core' | 'wipe'
export type Position = [number, number, number]
export type TargetId = SuspectId | BystanderId
export type Decision = 'release' | 'return' | 'delete'
export interface Person { id: TargetId; name: string; role: string; color: string; position: Position; opening: string; question: string }
export interface Suspect extends Person { id: SuspectId }
export interface Bystander extends Person { id: BystanderId; suit: string; skin: string }
export interface Clue { id: ClueId; title: string; category: string; description: string; icon: string }
export interface Message { role: 'player' | 'suspect'; text: string }
export interface SaveGame { version: 2; session: string; clues: ClueId[]; histories: Record<TargetId, Message[]>; revealed: boolean; decision: Decision | null }
export interface Reply { game: SaveGame; mode: 'live' | 'demo' | 'fallback'; reaction?: { name: string; text: string } }
