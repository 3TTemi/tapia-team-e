# Capital Punishment

## ElevenLabs character voices

`npm run dev` starts the real voice endpoint alongside the game. `npm run dev:full` is an alias; no second server is needed. Set `ELEVENLABS_API_KEY` and `ELEVENLABS_ALEX_VOICE_ID`, `ELEVENLABS_JORDAN_VOICE_ID`, `ELEVENLABS_SAM_VOICE_ID` in local `.env`, then restart. Use actual voice IDs, not voice names. The model defaults to `eleven_multilingual_v2`.

Verified final replies trigger voice generation without blocking the next question. The interview includes mute and play/replay controls; replay reuses the last generated clip. Leaving an interview or asking another question stops its audio. Missing configuration, provider failures, and browser playback blocks appear in the interview instead of failing silently. Gabby uses ElevenLabs for Spanish replies with the same mute/replay controls; English captions remain available through Translate to English. Configure her voice with ELEVENLABS_LUCIA_VOICE_ID (her saved internal ID).

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

## OpenAI backup

Add `OPENAI_API_KEY` to your local `.env` and restart Vite. `OPENAI_MODEL` defaults to `gpt-4.1-mini`. OpenAI is now the default and skips Gemini completely. Set `AI_PROVIDER=gemini` to restore Gemini-first routing with OpenAI backup on failures. With only an OpenAI key, interviews use OpenAI directly. Both providers unavailable means a labeled scripted response. Each provider request times out after 8 seconds; an interview can make up to three requests. The HUD reports OpenAI whenever it handled either generation or verification. Keys never enter browser code.

`npm run ai:check` checks the configured chain; `npm run ai:check -- --openai` tests the backup directly.

## Spanish witness / accessibility demo

Gabby waits outside the café, left of the main route toward the bank. Approach and press E. She is an optional witness, not a fourth suspect in the verdict menu. Her translation phone lifts during conversation; ask in English or Spanish to receive a Spanish reply with English captions. Press Translate to English to reveal English captions; translation mode also supports larger captions. Spanish speech uses ElevenLabs and the shared interview voice controls. Audio can be muted and stops when you leave. This is generated bilingual dialogue, not microphone speech recognition; no microphone access is needed. The same fact check also checks translation fidelity. Scripted fallback includes a matched authored translation. Existing saves gain her separate history without resetting the case.
