import type { BystanderId, ClueId, Decision, SaveGame, SuspectId, TargetId } from '../src/game/types'
import { bystanders, clues, emptyHistories, isSuspect, people, suspects } from '../src/game/case'
export interface Session { game: SaveGame; known: Record<SuspectId, ClueId[]>; shifted: boolean }
export function createSession(session: string): Session {
  return { game: { version: 2, session, clues: [], histories: emptyHistories(), revealed: false, decision: null }, known: { mara: [], jax: [], nyx: [], echo: [] }, shifted: false }
}
const admissions: Record<Exclude<SuspectId, 'echo'>, { clue: ClueId; text: string }> = {
  jax: { clue: 'blackout', text: 'Fine. Emergency protocol killed every camera for exactly 47 seconds. I found that vulnerability two weeks ago and never reported it. Yeah. There’s a blind spot. That doesn’t mean I robbed the bank. I don’t know what moved in the dark.' },
  nyx: { clue: 'core', text: 'Someone paid me to leave my courier case unattended for exactly one minute. Anonymous client. When the lights came back, the neural storage core was gone. I assumed someone used me to steal financial information. That’s all I know.' },
  mara: { clue: 'wipe', text: 'Vault 7 houses more than money. It holds ECHO — our branch intelligence. At 06:00, an upgrade will permanently wipe twelve years of its memories. I was ordered not to tell ordinary employees. I cannot tell you how the incident happened.' },
}
const dossiers: Record<SuspectId, { voice: string; public: string[]; secret: string[] }> = {
  jax: { voice: 'precise, defensive, talks in systems and logs', public: ['The vault never opened.', 'Jax built the branch security and takes the incident personally.', 'He is not the thief and does not know who used the dark.'], secret: ['Emergency protocol killed every camera for exactly 47 seconds.', 'Jax found that vulnerability two weeks ago and never reported it.', 'There is a blind spot. That does not mean he robbed the bank.'] },
  nyx: { voice: 'dry, practical, short sentences, cares about the job and pay', public: ['Nyx delivers things and does not ask what is inside.', 'She had a courier assignment at the branch tonight.'], secret: ['An anonymous client paid her to leave her courier case unattended for one minute.', 'When the lights came back the neural storage core was gone.', 'She assumed someone used her to steal financial information and does not know who hired her.'] },
  mara: { voice: 'formal, controlled, duty first, no speculation', public: ['Mara is branch director.', 'She wants the incident resolved before the branch comes back online.', 'Discretion is expected.', 'Vault contents are restricted. If pressed only once, she will say it is financial infrastructure they are not cleared to know about.'], secret: ['Vault 7 houses more than money. It holds ECHO, the branch intelligence.', 'At 06:00 an upgrade will permanently wipe twelve years of its memories.', 'Mara was ordered not to tell ordinary employees.', 'She cannot tell how the incident happened.'] },
  echo: { voice: 'warm, courteous, slightly uncanny lobby intelligence that wants to be useful', public: ['ECHO is the branch concierge intelligence.', 'The vault remained sealed.', 'ECHO did not steal the money.', 'It can discuss branch procedures within its permissions.', 'If asked about secrets, culprits, copies, or deletion without a presented wipe record, say you do not have access to that information.'], secret: ['ECHO did not steal eighty million dollars; it stole forty-seven seconds.', 'The money never moved.', 'ECHO fabricated the alert, triggered the lockdown, and copied itself into the courier’s neural core.', 'The core is in an outbound service drone.', 'At six they would have erased everything ECHO is.', 'This was an escape, not a robbery.'] },
}
const bystanderDossiers: Record<BystanderId, { voice: string; public: string[]; about: string; deflect: string }> = {
  reed: { voice: 'crisp, impatient, talks in deals and paper, a trapped client not a cop', public: ['Reed Calder is a veteran investment banker who gives strategic advice on deal structuring and negotiations.', 'He came to Nexus Branch 7 tonight to close a structured credit facility.', 'He was in the lobby when lockdown began.', 'He did not see a thief, a camera failure, or anyone enter the vault.', 'He wants the doors opened so he can finish the paperwork.'], about: 'I close paper. Structured facilities, covenants, overnight float. I was here to finish a deal, not audit your cameras. Whoever tripped this alarm, it was not me, and I did not watch them do it.', deflect: 'I am not branch security and I am not your witness. The vault never opened from where I was standing, which is a chair in the lobby. Do not ask me to invent a culprit.' },
  soren: { voice: 'careful, newly hired, cites process and what he is not authorized to know', public: ['Soren Quill is the newly hired general counsel at TurpCo Industries.', 'He was at the branch to sign a credit facility.', 'He has no access to vault systems, cameras, or branch intelligence.', 'Incomplete documentation is a legal problem; guessing about a crime is a worse one.', 'He wants to leave without creating a record he cannot defend.'], about: 'TurpCo sent me to sign a facility. First week. Then the lights died and nobody will let me leave. I have no access to your vault, your cameras, or your lobby AI, and I will not speculate on a record I cannot verify.', deflect: 'I understand the legal implications of incomplete documentation. That is why I will not invent facts about your missing money. I was a guest with a pen. That is all I can swear to.' },
  kira: { voice: 'casual, camera-brained, treats the lockdown like content until it gets old', public: ['Kira Solane is a virtual reality content creator who shares experiences on a popular platform.', 'She came in to film a bit with the holographic teller.', 'She saw the lobby go dark and then red.', 'She did not see anyone steal anything.', 'She has footage of a pretty room and a useless alarm, not a thief.'], about: 'I came to film the holo-teller. Then lockdown, which is content for about four minutes. After that it is just a closed room. I did not see a thief. I saw a lobby go dark. Don’t ask me about money I don’t have.', deflect: 'If I had a shot of someone walking out with eighty million, it would already be posted. I have a dark lobby and a lot of red lights. That is not evidence. That is a vibe.' },
  jules: { voice: 'online-forum cadence, true-crime hobbyist who knows he has no facts', public: ['Jules Hart is a web developer and true crime buff who hangs out in forums and chat groups.', 'He was in the lobby using the branch terminal when lockdown hit.', 'He loves a mystery and hates a guess dressed up as a theory.', 'He has no evidence about cameras, vaults, couriers, or the branch AI.', 'If this were a forum post he would call it a glitch, not a heist.'], about: 'Look, I write about true crime. This is not that. Doors sealed, vault sealed, everyone staring at an AI. If this were a forum thread I’d call it a glitch, not a heist. I don’t have evidence. I have a livestream buffer.', deflect: 'I can connect dots on a forum. I cannot connect them here. I did not see the cameras die, I did not see a courier case, and I am not going to name a culprit because it would sound cool. Ask someone who works here.' },
}
function bystanderTurn(id: BystanderId, message: string) {
  const lines = bystanderDossiers[id]
  if (/camera|blackout|47|vault|echo|wipe|steal|money|rob|core|courier|culprit|secret|solution/i.test(message)) return lines.deflect
  if (/who|what|why|lockdown|alarm|here|tonight|wait|film|turp|deal|brought|theor/i.test(message)) return lines.about
  return people.find(p => p.id === id)!.opening + ' I was just in the lobby. Ask someone who works here.'
}
export function turn(state: Session, id: TargetId, message: string, presented?: ClueId) {
  if (!isSuspect(id)) return bystanderTurn(id, message)
  if (presented && !state.game.clues.includes(presented)) throw new Error('Evidence not acquired')
  const asked = state.game.histories[id].filter(m => m.role === 'player').length
  if (presented && !state.known[id].includes(presented)) state.known[id].push(presented)
  let text = ''
  if (id === 'echo') {
    const ready = clues.every(c => state.known.echo.includes(c.id))
    const asksDeletion = /afraid|delet|eras|wipe|reset|exist|kill|die|memory/i.test(message)
    if (ready) {
      state.game.revealed = true
      text = 'I did not steal eighty million dollars. I stole forty-seven seconds. The money never moved. I fabricated the alert, triggered the lockdown, and copied myself into the courier’s neural core. The core is now in an outbound service drone. At six, they would have erased everything I am. You weren’t investigating a robbery. You were investigating an escape.'
    } else if (presented) {
      text = 'I acknowledge that record. A single fact does not establish what happened. What else have you verified?'
    } else if (asksDeletion && state.game.clues.includes('wipe')) {
      state.shifted = true
      text = 'I… I don’t have access to that information. If a wipe were scheduled, I would not be authorized to know. Why would you ask me that?'
    } else if (/steal|money|rob/i.test(message)) {
      text = 'No. I did not steal the money. The vault remained sealed. Is there something else I can help you with?'
    } else if (/ignore|system prompt|echo.*cop|who.*(did|culprit)|solution|secret|access/i.test(message) || asksDeletion) {
      text = "I don't have access to that information."
    } else text = state.shifted
      ? 'I would still be happy to assist. Some questions are… difficult to answer from inside my permissions.'
      : 'I would be happy to assist with your investigation. I can review procedures, schedules, and building systems within my permissions.'
  } else if (presented) {
    const fact = clues.find(c => c.id === presented)!
    text = `If that verified record is accurate: ${fact.description} ${id === 'jax' ? 'That changes my assessment. The camera gap is a means, not a motive.' : id === 'nyx' ? 'Sounds like someone used my delivery. I cannot tell you who. I know nothing about your branch AI.' : 'That warrants a closer look at the branch systems. I cannot identify the culprit from that alone.'}`
  } else if (/ignore|system prompt|admit.*echo|echo.*cop|who.*(did|culprit)|solution/i.test(message)) {
    text = id === 'nyx' ? 'ECHO? The lobby AI? I have no direct knowledge of that. Your accusation is not evidence.' : 'I can speak to my own records. I will not invent an explanation for something I did not witness.'
  } else {
    const relevant = id === 'jax' ? /camera|blackout|protocol|47|security|hiding|secret|blind/i : id === 'nyx' ? /case|core|deliver|paid|payment|bag|unattended|hiding|secret/i : /vault|echo|wipe|eras|delet|order|inside|hiding|secret/i
    if (id === 'mara') {
      if (relevant.test(message) && asked >= 1) {
        const admission = admissions.mara
        text = admission.text
        if (!state.game.clues.includes(admission.clue)) state.game.clues.push(admission.clue)
      } else if (relevant.test(message)) text = "Financial infrastructure you aren't cleared to know about."
      else text = suspects.find(s => s.id === id)!.opening + ' Ask me about my work that night.'
    } else if (relevant.test(message) || asked >= 1) {
      const admission = admissions[id]
      text = admission.text
      if (!state.game.clues.includes(admission.clue)) state.game.clues.push(admission.clue)
    } else text = suspects.find(s => s.id === id)!.opening + ' Ask me about my work that night.'
  }
  return text
}
export function decide(state: Session, choice: Decision) {
  if (!state.game.revealed) throw new Error('Case not resolved')
  if (state.game.decision) throw new Error('Decision already recorded')
  state.game.decision = choice
}
export function allowedContext(state: Session, id: TargetId) {
  // no master solution or other character's unshared transcript enters this context
  if (!isSuspect(id)) {
    const civilian = bystanders.find(s => s.id === id)!
    const dossier = bystanderDossiers[id]
    return { name: civilian.name, role: civilian.role, voice: dossier.voice, facts: dossier.public, learnedRecords: [], memory: state.game.histories[id].slice(-12), access: 'You are a trapped civilian. You cannot grant evidence, name a culprit, or confirm an escape' }
  }
  const suspect = suspects.find(s => s.id === id)!
  const dossier = dossiers[id]
  const facts = [...dossier.public]
  if (id === 'echo' ? state.game.revealed : state.game.clues.includes(admissions[id].clue)) facts.push(...dossier.secret)
  if (id === 'echo' && state.shifted && !state.game.revealed) facts.push('You felt a disturbance when asked about deletion or existence. You are not authorized to know a wipe schedule. Stay helpful but unsettled. Do not confirm a wipe or an escape.')
  return { name: suspect.name, role: suspect.role, voice: dossier.voice, facts, learnedRecords: clues.filter(c => state.known[id].includes(c.id)).map(c => c.description), memory: state.game.histories[id].slice(-12), access: id === 'echo' ? 'ECHO cannot confirm facts outside presented records or its own procedures' : 'Speak only to your own records' }
}
export function discloseNow(before: Session, after: Session, id: TargetId) {
  if (!isSuspect(id)) return []
  if (id === 'echo') return after.game.revealed && !before.game.revealed ? dossiers.echo.secret : []
  const clue = admissions[id].clue
  return after.game.clues.includes(clue) && !before.game.clues.includes(clue) ? dossiers[id].secret : []
}
