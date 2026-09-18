import { emptyHistories } from './case'
import type { SaveGame } from './types'
const KEY = 'ghost-vault-session-v2'
export const freshGame = (): SaveGame => ({ version: 2, session: crypto.randomUUID(), clues: [], histories: emptyHistories(), revealed: false, decision: null })
export function loadGame(): SaveGame {
  const game = freshGame()
  try { const session = localStorage.getItem(KEY); if (session && /^[a-f0-9-]{36}$/.test(session)) game.session = session } catch { /* in-memory session */ }
  return game
}
export function persistGame(game: SaveGame): boolean {
  try { localStorage.setItem(KEY, game.session); return true } catch { return false }
}
