import test from "node:test";
import assert from "node:assert/strict";
import { interviewStream } from "./interview";
import { newSession } from "./store";

const config = {
  apiKey: "test-key",
  model: "gpt-4o-mini",
  scripted: false,
  openaiApiKey: "openai-test",
  openaiModel: "gpt-4.1-mini",
};

test("interviewStream emits tokens before persisting a guarded fallback", async () => {
  const memory = newSession().characters.alex;
  const tokens: string[] = [];
  let replaced: string | undefined;

  const result = await interviewStream(
    { suspectId: "alex", message: "Where were you?" },
    memory,
    config,
    {
      start: () => {},
      token: (_delta, text) => tokens.push(text),
      replace: (text) => {
        replaced = text;
      },
    },
    {
      streamReply: async (_c, _s, _i, onDelta) => {
        for (const part of ["I ", "was ", "mopping."]) onDelta(part);
        return { text: "I was mopping.", provider: "gemini" as const };
      },
      generate: async () => ({ supported: false }),
    },
  );

  assert.deepEqual(tokens, ["I ", "I was ", "I was mopping."]);
  assert.ok(replaced);
  assert.equal(result.mode, "guarded");
  assert.equal(memory.history.at(-1)?.text, replaced);
});

test("scripted stream typewrites the authored fallback", async () => {
  const memory = newSession().characters.sam;
  const seen: string[] = [];
  const result = await interviewStream(
    { suspectId: "sam", message: "Hello" },
    memory,
    { ...config, apiKey: "", openaiApiKey: "", scripted: false },
    {
      start: (info) => assert.equal(info.mode, "scripted"),
      token: (_delta, text) => seen.push(text),
      replace: () => {},
    },
    {
      scriptedStream: async (text, onDelta) => {
        let full = "";
        for (const word of text.split(" ")) {
          full += `${word} `;
          await onDelta(`${word} `);
        }
        return full.trim();
      },
    },
  );

  assert.ok(seen.length > 1);
  assert.equal(result.mode, "scripted");
  assert.equal(memory.history.at(-1)?.role, "suspect");
});

test("streamed pickup file unlocks both bundled records for Sam", async () => {
  const memory = newSession().characters.sam;
  const result = await interviewStream(
    { suspectId: "sam", message: "Explain this file.", presentedClue: "heat" },
    memory,
    { ...config, scripted: true },
    { start: () => {}, token: () => {}, replace: () => {} },
    { scriptedStream: async (text) => text },
  );
  assert.deepEqual(memory.presented, ["badge", "heat"]);
  assert.match(result.text, /I planned the robbery/);
});
