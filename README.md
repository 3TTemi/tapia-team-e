# Last Commit

A detective game: start in a Capital One café, cross the plaza to a robbed bank, question three witnesses, and prove who arranged the cash pickup. A ten-second opening leads into first-person exploration.

## Run locally

Use Node.js 22.12+ and npm.

```sh
npm install
cp .env.example .env # only if you do not already have .env
```

Put your Google AI Studio key in `.env` as `GEMINI_API_KEY=...`. Keep the key local; never use a `VITE_` prefix or commit it. `GEMINI_MODEL` selects the model, defaulting to `gemini-3.8-flash`.

```sh
npm run ai:check # verifies actual model access without printing the key
npm run dev     # starts the game AND local interview API
```

Open the localhost URL printed by Vite. Restart after changing `.env`. Without a key, or if Gemini fails, interviews use clearly labeled authored replies. Set `DIALOGUE_MODE=scripted` for an offline demo.

```sh
npm test
npm run build
npm run preview # local production preview also includes the interview API
```

Static hosting of `dist` alone does not include the API. This backend is intended for a local hackathon demo.

## Conversations

The browser calls `/api/interview`; only the local Node middleware calls Gemini. Each session has separate witness transcripts and explicitly presented evidence, saved under ignored `.data/interviews/`. Reset case starts a new session. Browser saves use a new bank-case key so old robot-case progress cannot contaminate the story.

The server supplies only facts unlocked for that witness. A second Gemini call checks the generated reply against those facts; rejected or failed replies use authored text. This adds latency and API usage, and is a guardrail rather than a guarantee against hallucinations. Unknown model access, quota, or network problems are surfaced in the interview panel. The status badge says “ready” until an actual generated reply succeeds.

This is a local single-player prototype: collected inventory is reported by the browser and the accusation rules are inspectable in the bundle. It is not an anti-cheat or multiplayer service. See [the case bible](docs/BANK_CASE.md) for the evidence gates and short demo route.

## Controls

| Input             | Action                                                       |
| ----------------- | ------------------------------------------------------------ |
| WASD / arrow keys | Move                                                         |
| Shift + movement  | Sprint                                                       |
| V                 | Toggle cinematic bloom/rain and performance mode             |
| Mouse             | Look around                                                  |
| E                 | Talk to / inspect the object in your crosshair, within reach |
| N                 | Open the case notebook                                       |
| Esc               | Release the mouse / dismiss an open panel                    |

Click **Enter the café** or **Resume investigation** to capture the mouse. If the browser rejects immediate recapture after Escape, click Resume again. If mouse capture is unavailable, choose **Use keyboard controls instead**: WASD moves, Q/R turns, T/G looks up/down, and E interacts. Progress and separate suspect transcripts save in this browser's local storage. Use **Case notebook → Reset case** for a clean demo. The 11:47 clock is story atmosphere, not a real time limit.

## Team ownership

- World and cinematic: `src/world/`, `src/ui/OpeningOverlay.tsx`.
- Story: `src/game/case.ts`, scripted dialogue tests, `server/characters.ts`.
- AI integration: `server/`, `src/game/chat.ts`, `vite.config.ts`.
- Interface: `src/ui/Panels.tsx`, `src/App.tsx`.
