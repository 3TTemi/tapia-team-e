import test from "node:test";
import assert from "node:assert/strict";
import { decideCharacterAction } from "./actionDecision";

const config = {
  apiKey: "test-key",
  model: "gemini-test",
  scripted: false,
  openaiApiKey: "openai-test",
};

test("AI action decision waits before returning a visual action", async () => {
  const started = Date.now();
  const action = await decideCharacterAction(
    {
      suspectId: "jordan",
      message: "Turn around! It's the bank robber!",
      characterName: "Jordan",
      persona: "Security guard",
    },
    config,
    async () => ({ action: "turn-around" }),
  );
  assert.ok(Date.now() - started >= 1500);
  assert.equal(action?.kind, "turn-around");
});

test("none action yields no animation", async () => {
  const action = await decideCharacterAction(
    {
      suspectId: "alex",
      message: "Where were you tonight?",
      characterName: "Alex",
      persona: "Janitor",
    },
    config,
    async () => ({ action: "none" }),
    0,
  );
  assert.equal(action, null);
});

test("interviewStream emits AI-chosen actions after deliberation", async () => {
  const { interviewStream } = await import("./interview");
  const { newSession } = await import("./store");
  const memory = newSession().characters.jordan;
  let seen: string | undefined;

  await interviewStream(
    { suspectId: "jordan", message: "Turn around! It's the robber!" },
    memory,
    config,
    {
      start: () => {},
      token: () => {},
      replace: () => {},
      action: (action) => {
        seen = action.kind;
      },
    },
    {
      streamReply: async (_c, _s, _i, onDelta) => {
        onDelta("Wait— what?");
        return { text: "Wait— what?", provider: "openai" as const };
      },
      generate: async () => ({ supported: true }),
      decideAction: async () => ({
        kind: "turn-around" as const,
        target: [1.75, 0, 6.4] as const,
        startedAt: Date.now(),
        until: Date.now() + 5000,
      }),
    },
  );

  assert.equal(seen, "turn-around");
});
