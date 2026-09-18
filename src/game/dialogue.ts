import type { ClueId, Decision, Reply, TargetId } from './types'
export async function requestGame(session: string, action: 'state' | 'talk' | 'decide', options: { suspectId?: TargetId; message?: string; presentedClue?: ClueId; decision?: Decision } = {}): Promise<Reply> {
  const response = await fetch('/api/game', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session, action, ...options }), signal: AbortSignal.timeout(25000) })
  if (!response.ok) throw new Error('Connection interrupted. Please try again.')
  return response.json()
}
