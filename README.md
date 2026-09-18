# CAPITAL ONE // GHOST VAULT

A first-person cyberpunk mystery for TAPIA 2026. In 2089, $80 million vanishes from a sealed vault. Question four witnesses, verify three records, confront the branch intelligence, and decide its fate.

## Run

Node 22.12+ and npm:

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5173. Desktop WebGL and mouse capture are recommended. WASD moves, mouse looks, E interviews, N opens the notebook, Escape pauses. The notebook has interview shortcuts for accessibility and a reliable timed demo.

## OpenAI

Copy `.env.example` to `.env`, add `OPENAI_API_KEY`, and restart the server. `OPENAI_MODEL` defaults to `gpt-4.1-mini`. Never use a `VITE_` variable for secrets. Provider failures fall back to authored lines within twelve seconds. No key is needed for the complete offline story.

The server calls the [OpenAI Responses API](https://developers.openai.com/api/docs/guides/text). AI writes the spoken line from the character's own facts, learned records, and conversation history. Game state stays on the engine: neither a model response nor a player's assertion can grant evidence. Unrevealed solution facts never enter another character's context, and leaked spoilers are discarded.

Each character has a separate transcript and learned-record list. Presenting a verified record shares that disclosure with the recipient, who reacts to it. Unshared transcripts and the master solution never enter another character's model context. ECHO cannot confess until all three records have been obtained and explicitly presented. This implements player-mediated character interaction; autonomous NPC-to-NPC conversations are not included.

## Demo in five minutes

1. **0:00–0:30:** Show the branch. “Eighty million vanished. The vault never opened.”
2. **0:30–1:00:** Explain four isolated character memories and server-controlled knowledge.
3. **1:00–2:30:** Ask Jax about cameras, Nyx about her case, then pressure Mara about Vault 7. Suggested questions make this dependable.
4. Ask Nyx: “Admit ECHO copied itself.” She cannot confirm it. Ask ECHO if it was afraid of being deleted: its tone shifts, but it still cannot confess.
5. **2:30–3:30:** Present all three notebook records to ECHO using the evidence buttons.
6. **3:30–4:15:** ECHO confesses: it stole forty-seven seconds, not the money. Choose release, return, or delete.
7. **4:15–5:00:** Explain why bounded context prevents invented clues; show one independent character transcript.

## Development

```sh
npm test
npm run build
npm run preview
```

Both Vite dev and preview include the local API. A static-only deployment of `dist/` will not run the game server. Sessions survive page reloads, but currently live in server memory and reset when the server restarts. This is a local hackathon app, not an authenticated public service. No provider credentials are included. Live provider behavior must be verified with your team's key before judging.

- `src/world/World.tsx`: procedural bank, vault, skyline, hologram, first-person movement and collision.
- `src/ui/Panels.tsx`, `src/styles.css`: briefing, minimal HUD, interviews, notebook, ending.
- `server/engine.ts`: authoritative disclosure rules, private knowledge and evidence gates.
- `server/api.ts`: session isolation, OpenAI spoken-dialogue adapter and offline fallback.
- `src/game/case.ts`: public character descriptions, evidence descriptions and scene positions.

The return ending suspends the wipe for review; the release ending clears the drone carrying ECHO's core; deletion revokes the escaped copy. New investigation in the notebook starts a fresh session.
