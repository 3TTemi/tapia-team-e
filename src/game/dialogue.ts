import type { ClueId, Message, SuspectId } from './types'

export interface DialogueRequest {
  suspectId: SuspectId
  message: string
  presentedClue?: ClueId
  history: Message[]
}

/** Scripted adapter for the starter. Replace with a POST to a local backend.
 * Never put provider keys or the authoritative mystery solution in browser code.
 * Only explicitly presented evidence influences this character's response.
 */
export async function getReply(request: DialogueRequest): Promise<string> {
  return scriptedReply(request)
}

export function scriptedReply({ suspectId, message, presentedClue, history }: DialogueRequest): string {
  if (suspectId === 'alex') {
    if (presentedClue === 'log') return 'Fine. I broke the build. I put “DEMO CANCELLED” on the dashboard because I panicked. But that was before Sparky vanished. I didn’t move the robot.'
    if (presentedClue === 'dock' || presentedClue === 'heat') return 'That looks like a hardware problem. My mistake was software. Check with whoever handles equipment safety.'
    if (presentedClue) return 'I was debugging at my laptop. I can’t tell you what happened somewhere else.'
    if (history.some(m => m.role === 'suspect' && m.text.startsWith('Fine.'))) return 'I already admitted the failed deploy. The cancellation message was mine; the disappearance wasn’t. Follow the hardware evidence.'
    return 'I was fixing a dependency conflict. That’s all. If you think I did something, show me the build log.'
  }
  if (suspectId === 'jordan') {
    if (presentedClue === 'photo') return 'You found the photo. Yes, I photographed your design. Bad look, I know. But look behind the desk: I saw Sam pushing that cart toward the repair room. The thing under the jacket had Sparky’s antenna.'
    if (presentedClue) return 'That’s interesting, but I didn’t see that happen. I’m only going to speak for what I actually witnessed.'
    if (history.some(m => m.role === 'suspect' && m.text.startsWith('You found'))) return 'Like I said: Sam, a cart, and a square antenna. I shouldn’t have taken that photo, but it gives you a lead.'
    return /photo|camera|copy/i.test(message) ? 'Lots of people take photos at hackathons. Have you actually got one with my name on it?' : 'I was getting snacks. You can’t accuse someone just because their demo is better. Got any evidence?'
  }
  if (presentedClue === 'heat') return 'Okay. I acknowledged that alert. Sparky’s battery was overheating, so I unplugged it and moved it to the repair room. I covered it to keep people from touching it. I should have left a note. I was afraid you’d blame me.'
  if (history.some(m => m.role === 'suspect' && m.text.startsWith('Okay.'))) return 'Sparky is safe in the repair room. I moved it because of the battery alert. I’m sorry I didn’t tell your team immediately.'
  if (presentedClue === 'photo') return 'That is my cart. I move equipment all night. The picture doesn’t explain why I was moving it.'
  if (presentedClue === 'badge') return 'Of course my badge opens the repair room. I’m the volunteer responsible for equipment. Check the safety terminal if you want the whole picture.'
  if (presentedClue === 'dock') return 'A scorch mark? You should check the battery telemetry terminal by the entrance.'
  return 'I’m responsible for keeping this event safe. I won’t speculate. If there was an equipment issue, there will be a safety alert.'
}

export function evaluateAccusation(suspect: SuspectId, motive: string, evidence: ClueId[]): boolean {
  return suspect === 'sam' && motive === 'safety' && evidence.includes('heat') && (evidence.includes('badge') || evidence.includes('photo'))
}
