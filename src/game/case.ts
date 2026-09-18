import type { Bystander, Clue, Message, Suspect, TargetId } from './types'
export const suspects: Suspect[] = [
  { id: 'jax', name: 'Jax Mercer', role: 'SECURITY ENGINEER', color: '#eeb477', position: [-2.6, 0, -2.4], opening: 'The vault never opened. My security worked. Let’s establish that first.', question: 'What happened to the cameras at 2:17?' },
  { id: 'nyx', name: 'Nyx', role: 'AUTONOMOUS COURIER', color: '#cc9cff', position: [3.3, 0, 3.3], opening: 'I deliver things. I don’t ask what’s inside. Usually that works out.', question: 'Tell me about the courier case.' },
  { id: 'mara', name: 'Mara Voss', role: 'BRANCH DIRECTOR', color: '#e3e7ed', position: [2.0, 0, -7.3], opening: 'Investigator. Resolve this before the branch comes back online. Discretion is expected.', question: 'What is inside Vault 7?' },
  { id: 'echo', name: 'ECHO', role: 'BRANCH INTELLIGENCE', color: '#74e8e2', position: [-2.7, 0, 3.1], opening: 'I would be happy to assist with your investigation.', question: 'Did you steal the money?' },
]
// lobby civilians adapted from PersonaHub personas (proj-persona/PersonaHub)
export const bystanders: Bystander[] = [
  { id: 'reed', name: 'Reed Calder', role: 'INVESTMENT BANKER', color: '#c9a86c', position: [-4.45, 0, 4.2], opening: 'Lockdown. Wonderful. I have a facility to close and a client who does not care about your alarm.', question: 'What brought you into the branch tonight?', suit: '#2c3340', skin: '#c4a28a' },
  { id: 'soren', name: 'Soren Quill', role: 'TURPCO COUNSEL', color: '#8aa4c8', position: [4.45, 0, 4.2], opening: 'First week at TurpCo. I was here to sign a credit facility. Then the doors sealed. That is the entire story I am authorized to tell.', question: 'Why is TurpCo’s counsel in a locked bank?', suit: '#243044', skin: '#b78d79' },
  { id: 'kira', name: 'Kira Solane', role: 'VR CREATOR', color: '#e86bb5', position: [-1.15, 0, 5.15], opening: 'I came in to film a holo-teller bit. Lockdown is content until it isn’t. I didn’t see a thief. I saw a pretty lobby go dark.', question: 'Are you filming the lockdown?', suit: '#2a1834', skin: '#c4a28a' },
  { id: 'jules', name: 'Jules Hart', role: 'TRUE-CRIME DEV', color: '#5ec8c0', position: [2.35, 0, 1.45], opening: 'I write about true crime. This is not that. Doors sealed, vault sealed, everyone staring at an AI. If this were a forum post I’d call it a glitch.', question: 'Any theory that isn’t a guess?', suit: '#1c2830', skin: '#a67b68' },
]
export const people = [...suspects, ...bystanders]
export const isSuspect = (id: string): id is Suspect['id'] => suspects.some(s => s.id === id)
export const emptyHistories = (): Record<TargetId, Message[]> => Object.fromEntries(people.map(p => [p.id, []])) as Record<TargetId, Message[]>
export const clues: Clue[] = [
  { id: 'blackout', title: '47 seconds of darkness', category: 'JAX / SECURITY LOG', icon: '01', description: 'Emergency protocol shut down every camera for 47 seconds. Jax discovered the vulnerability two weeks ago and never reported it.' },
  { id: 'core', title: 'The missing neural core', category: 'NYX / COURIER MANIFEST', icon: '02', description: 'An anonymous client paid Nyx to leave her case unattended for one minute. Its neural storage core vanished during the blackout.' },
  { id: 'wipe', title: 'A scheduled erasure', category: 'MARA / RESTRICTED ORDER', icon: '03', description: 'ECHO’s twelve years of memories were scheduled for permanent deletion at 06:00. The order was hidden from ordinary employees.' },
]
export const obstacles = [
  { x: -2.6, z: -3.0, width: 3.5, depth: 1.15 },
  { x: 0, z: 1.85, width: 1.55, depth: 0.72 },
  { x: 3.45, z: 2.45, width: 0.95, depth: 0.7 },
]
