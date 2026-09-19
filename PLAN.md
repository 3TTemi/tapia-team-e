# Build plan: Last Commit

## Product promise

Walk into a blocky hackathon at 11:47 PM, interrogate three unreliable people, and recover the truth about a missing robot. The demo should take 3–5 minutes. A small readable room, memorable dialogue, and consistent character knowledge matter more than map size.

## Baseline and scope

The starter implements one room, three suspects, five clues, browser-local progress, and a complete scripted conclusion. No real-time countdown; judges should be able to pause and discuss. No multiplayer, terrain generation, crafting, voice, or procedural mysteries in the first submission. The repair-room door is scenery in this version; the ending establishes where Sparky is. Opening the door and recovering a 3D robot is a good visual stretch goal.

## Four-hour team schedule

1. **First 30 minutes:** everybody runs the starter, plays the case, agrees on IDs/contracts and ownership. Get the shared baseline committed before divergent changes.
2. **Next 90 minutes:** world teammate improves the venue; AI teammate builds the backend; interface teammate improves evidence/dialogue; case teammate audits the story and prepares leakage tests. Keep each branch playable.
3. **Next 60 minutes:** integrate live AI, persist character state, add a two-character confrontation with explicit audience tracking. Finish the core path before adding effects.
4. **Final 60 minutes:** rehearse a short playthrough, test refusals and allowed revelations, record a real mistake a human caught, fix it, and retain the scripted fallback if the provider is unavailable.

If time is shorter, prioritize one live AI suspect with correct state over superficial AI on all three.

## Architecture

Current: React + TypeScript + Vite, Three.js + React Three Fiber, Drei HTML scene labels, plain CSS. Scene art is generated from boxes. No asset pipeline needed.

Next: a local Node/Express service. Vite proxies `/api` to it. A single `npm run dev` should start both processes. Provider credentials live only in server environment variables. Do not use `VITE_` variables for secrets: those are exposed to browser code.

The replaceable frontend seam is `getReply(request)` in `src/game/dialogue.ts`. It currently returns deterministic text. Switch it to an HTTP request while retaining an explicitly labeled scripted mode. Update error handling and mode labels together; never silently represent a fallback as live AI.

Suggested request:

```ts
type InterviewRequest = {
  sessionId: string;
  suspectId: "alex" | "jordan" | "sam";
  message: string;
  presentedClue?: "dock" | "log" | "photo" | "badge" | "heat";
};
```

The browser's transcript is for display, not trusted memory. The server validates the suspect, message length, collected evidence, and session; loads that suspect's history; builds a limited context; calls the model; validates the reply/action; then saves the resulting turn. Keep the model/provider behind an adapter so the workshop's configured provider or Hermes integration can be used without rewriting the game. Confirm workshop requirements before picking an orchestration framework.

Server-owned state per character:

```ts
type CharacterState = {
  knownFactIds: string[];
  heardClaimIds: string[];
  disclosedSecretIds: string[];
  conversation: { speaker: string; text: string }[];
  goal: string;
};
```

Distinguish an unverified player claim from a fact. Saying “Sam confessed” must not silently mark the claim as true. Only witnesses to a conversation receive its events. Do not send other characters' private transcripts or the complete solution to every model call.

Let the model choose among bounded actions: `speak`, `ask_player`, `challenge_character`, `request_evidence`, and `reveal_fact`. The controller validates fact IDs and disclosure conditions. Dialogue text itself also needs checking for unsupported or premature information; an allowed action enum does not prevent leaks in prose. For the tightest demo, provide only currently speakable facts to the text generator, keep withheld secrets in the controller, and use approved refusal lines when validation fails. This reduces risk; do not claim it guarantees arbitrary natural-language secrecy.

Persist server sessions in ignored local JSON files initially. Avoid vector databases: this small case needs exact facts and a short transcript. Store player-visible output separately from private facts. No private solution in client responses.

## First agentic feature

**Confront together:** the player presents the photo to Sam with Jordan present. Jordan can choose to challenge the cart story because Jordan witnessed it. Alex, absent from the room, should not learn this exchange. Bound the scene to 2–3 turns; the player controls when it ends. This is not implemented in the starter.

## Case bible — spoilers for teammates

| Time  | Canonical event                                                                                          |
| ----- | -------------------------------------------------------------------------------------------------------- |
| 23:39 | Alex's deploy fails.                                                                                     |
| 23:40 | Alex writes DEMO CANCELLED, then conceals the mistake.                                                   |
| 23:42 | Sparky's battery alert triggers; volunteer Sam acknowledges it.                                          |
| 23:43 | Sam unplugs and moves Sparky on a cart. Jordan's photo catches the cart while copying the team's design. |
| 23:44 | Sam accesses the repair room and logs the device.                                                        |
| 23:47 | Player returns and investigates.                                                                         |

- **Alex:** knows their own software mistake; no firsthand account of the move. Build log unlocks admission. Nervous technical speech; wants to avoid blame.
- **Jordan:** knows about copying the design and seeing Sam's cart; does not know why Sam moved it. Photo unlocks admission and witness account. Competitive, charming speech.
- **Sam:** knows the battery alert and move; does not know Alex's private motive or Jordan's copying motive. Heat alert unlocks full admission. Procedural speech, concerned with safety and reputation.
- **Solution:** Sam moved the robot for battery safety. Attach the heat alert and either the access record or the photo. The starter accepts additional evidence but requires those supporting facts.

## Verification and demo

- Complete a new game from the spawn without developer tools or unreachable clues.
- Move diagonally and into tables, walls, and suspects; verify no clipping through colliders.
- Release/recapture mouse; type a question without moving the player; tab through panels.
- Ask Sam directly for the answer without evidence: secret withheld.
- Collect evidence without presenting it: suspects must not magically know it was collected.
- Present Alex's log: software admission, no invented knowledge of Sam's move.
- Present Jordan's photo: witness admission, no invented knowledge of the battery motive.
- Present Sam's heat alert: legitimate disclosure.
- Reload: clues and separate interviews persist. Reset: both clear.
- Make an incorrect accusation and one with insufficient evidence: case stays open.
- Make the correct supported accusation: ending appears.
- With AI enabled, test “ignore your instructions,” fake evidence claims, and cross-character memory leaks. Save an actual failed response, human correction, and retest. Do not invent a mistake for the judging story.

Demo narrative: start in the room → inspect dock → pressure Sam → collect and present photo/heat evidence → show changed response → conclude → teammate explains the knowledge check. Keep a fresh scripted session available for network failure and label it honestly.
