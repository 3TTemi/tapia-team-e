# Last Commit

A first-person, blocky detective game set at a late-night hackathon. Sparky, your team's robot, has disappeared. Explore the venue, interview three suspects, collect five clues, and make an evidence-backed accusation.

## Run locally

Use Node.js 22.12+ (Node 22 LTS recommended) and npm.

```sh
npm install
npm run dev
```

Open the localhost URL printed by Vite (normally http://127.0.0.1:5173). No API keys, account, external assets, or backend are needed for this starter. Once dependencies are installed, the scripted game works offline. Use a desktop browser with WebGL and mouse capture support.

```sh
npm run build   # TypeScript check and production build
npm run preview # Serve that production build locally
npm test        # Character disclosure and solution rules
```

## Controls

| Input | Action |
| --- | --- |
| WASD / arrow keys | Move |
| Mouse | Look around |
| E | Talk to / inspect the object in your crosshair, within reach |
| N | Open the case notebook |
| Esc | Release the mouse / dismiss an open panel |

Click **Enter the hackathon** or **Resume investigation** to capture the mouse. If the browser rejects immediate recapture after Escape, click Resume again. Progress and separate suspect transcripts save in this browser's local storage. Use **Case notebook → Reset case** for a clean demo. The 11:47 clock is story atmosphere, not a real time limit.

## What works today

- Procedural 3D venue and blocky characters, with no downloaded art or font dependencies.
- First-person walking, mouse look, room/furniture/character collision, and nearby interactions.
- Three suspects with distinct scripted responses and individual conversation histories.
- Five inspectable clues, evidence presentation, persistent notebook, accusation, and ending.
- Clearly labeled scripted mode: this is **not yet the AI-agent submission**.

## Team ownership

| Workstream | Files to own | Next deliverable |
| --- | --- | --- |
| World / movement | `src/world/World.tsx` | Improve venue, characters, animations; keep interactions reachable |
| Characters / AI | `src/game/dialogue.ts`, future `server/` | Server-backed character adapter, isolated memories, bounded actions |
| Interface / experience | `src/ui/Panels.tsx`, `src/styles.css` | Better evidence visuals, dialogue polish, accessibility |
| Case / integration / QA | `src/game/case.ts`, `src/game/*.test.ts`, `src/App.tsx` | Consistent mystery, playthrough checks, demo script |

Agree on changes to `src/game/types.ts` together. Keep IDs stable. Ask before editing another workstream's files; use small branches and pull requests. `package-lock.json` should be committed with the starter so teammates install the same versions.

The scene is generated from code. Furniture colliders are shared with the rendered desks in `case.ts`. Moving a suspect or clue there also moves its interaction target.

## Next steps

See [PLAN.md](PLAN.md) for the four-hour scope, AI integration contract, and demo checklist. The solution and current disclosure rules are visible in the client source; this is a local prototype, not a secrecy boundary. Move authoritative facts and character state to the backend before adding AI.

The challenge describes a text-based game. Keep the interview/evidence loop central; the 3D room is an exploration layer around it.
