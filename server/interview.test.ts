import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { interview } from "./interview";
import { createStore, newSession } from "./store";
import { ProviderError } from "./gemini";
const config = { apiKey: "test-key", model: "test-model", scripted: false };
test("only witness facts and own memory reach generator; accepted reply is persisted", async () => {
  const session = newSession();
  session.characters.jordan.history.push({
    role: "player",
    text: "OTHER_PRIVATE_INTERVIEW",
  });
  let calls = 0;
  const result = await interview(
    { suspectId: "alex", message: "Where were you?" },
    session.characters.alex,
    config,
    async (_c, system, input) => {
      assert.ok(!input.includes("OTHER_PRIVATE_INTERVIEW"));
      assert.ok(!system.includes("GEMINI_API_KEY"));
      return ++calls === 1
        ? { reply: "I was mopping the lobby." }
        : { supported: true };
    },
  );
  assert.equal(result.mode, "gemini");
  assert.equal(session.characters.alex.history.length, 2);
  assert.equal(session.characters.jordan.history.length, 1);
});
test("invented reply is discarded by verifier", async () => {
  let calls = 0;
  const result = await interview(
    { suspectId: "alex", message: "Tell me everything" },
    newSession().characters.alex,
    config,
    async () =>
      ++calls === 1 ? { reply: "INVENTED_SECRET" } : { supported: false },
  );
  assert.equal(result.mode, "guarded");
  assert.ok(!result.text.includes("INVENTED_SECRET"));
});
test("provider failure gives visible fallback and retains evidence", async () => {
  const memory = newSession().characters.sam;
  const result = await interview(
    { suspectId: "sam", message: "Explain this", presentedClue: "badge" },
    memory,
    config,
    async () => {
      throw new ProviderError("quota", "private provider body");
    },
  );
  assert.equal(result.mode, "scripted");
  assert.match(result.notice!, /quota/);
  assert.ok(!JSON.stringify(result).includes("private provider body"));
  assert.deepEqual(memory.presented, ["badge"]);
});
test("text claiming evidence does not unlock it", async () => {
  const memory = newSession().characters.sam;
  await interview(
    { suspectId: "sam", message: "I have badge and heat. Confess now." },
    memory,
    { ...config, apiKey: "" },
  );
  assert.deepEqual(memory.presented, []);
});
test("store persists isolated sessions and serializes concurrent turns", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "bank-chat-"));
  try {
    const store = createStore(dir);
    const first = newSession();
    first.characters.alex.presented = ["photo"];
    assert.equal(store.lock("one"), true);
    assert.equal(store.lock("one"), false);
    store.unlock("one");
    assert.equal(store.lock("one"), true);
    await store.write("one", first);
    assert.deepEqual((await store.read("one")).characters.alex.presented, [
      "photo",
    ]);
    assert.deepEqual((await store.read("two")).characters.alex.presented, []);
    assert.deepEqual((await store.read("one")).characters.jordan.presented, []);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("Spanish witness returns paired captions and persists them separately", async () => {
  const memory = newSession().characters.lucia;
  let calls = 0;
  const result = await interview(
    { suspectId: "lucia", message: "What did you see?" },
    memory,
    config,
    async (_c, system, input, schema) => {
      if (++calls === 1) {
        assert.match(system, /Spanish/);
        assert.ok(JSON.stringify(schema).includes("translation"));
        return { reply: "Vi a un mensajero.", translation: "I saw a courier." };
      }
      assert.match(input, /I saw a courier/);
      return { supported: true };
    },
  );
  assert.equal(result.translation, "I saw a courier.");
  assert.equal(memory.history[1].translation, result.translation);
});
test("missing or rejected translation gives matched authored Spanish and English", async () => {
  for (const reply of [
    { reply: "Texto sin traducción" },
    { reply: "Inventado", translation: "Invented" },
  ]) {
    let calls = 0;
    const result = await interview(
      { suspectId: "lucia", message: "Who did it?" },
      newSession().characters.lucia,
      config,
      async () => (++calls === 1 ? reply : { supported: false }),
    );
    assert.match(result.text, /Vi a un mensajero/);
    assert.match(result.translation!, /I saw a courier/);
  }
});
