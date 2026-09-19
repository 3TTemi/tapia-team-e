import test from "node:test";
import assert from "node:assert/strict";
import { createGenerator, generateOpenAI } from "./providers";
import { replySchema, ProviderError } from "./gemini";
const config = {
  apiKey: "gemini-secret",
  model: "test",
  scripted: false,
  openaiApiKey: "openai-secret",
};
test("Gemini failure switches both reply and verifier to backup", async () => {
  let primary = 0,
    backup = 0;
  const router = createGenerator(
    config,
    async () => {
      primary++;
      throw new ProviderError("provider", "503");
    },
    async () => {
      backup++;
      return { reply: "okay" };
    },
  );
  await router.generate(config, "system", "input", replySchema);
  await router.generate(config, "guard", "input", replySchema);
  assert.equal(primary, 1);
  assert.equal(backup, 2);
  assert.equal(router.provider, "openai");
});
test("healthy Gemini never calls backup", async () => {
  const router = createGenerator(
    config,
    async () => ({ reply: "ok" }),
    async () => {
      assert.fail("Unexpected backup");
    },
  );
  await router.generate(config, "", "", replySchema);
  assert.equal(router.provider, "gemini");
});
test("missing backup preserves primary failure", async () => {
  const c = { ...config, openaiApiKey: "" };
  const router = createGenerator(c, async () => {
    throw new ProviderError("quota", "429");
  });
  await assert.rejects(router.generate(c, "", "", replySchema), /429/);
});
test("OpenAI-only configuration skips Gemini", async () => {
  const c = { ...config, apiKey: "" };
  const router = createGenerator(
    c,
    async () => {
      assert.fail();
    },
    async () => ({ reply: "ok" }),
  );
  assert.deepEqual(await router.generate(c, "", "", replySchema), {
    reply: "ok",
  });
});
test("OpenAI uses strict schema, no storage, and parses Responses output", async (t) => {
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "https://api.openai.com/v1/responses");
    const body = JSON.parse(String(options?.body));
    assert.equal(body.store, false);
    assert.equal(body.text.format.schema.additionalProperties, false);
    assert.equal(body.text.format.schema.properties.reply.type, "string");
    return new Response(
      JSON.stringify({
        status: "completed",
        output: [
          {
            type: "message",
            content: [{ type: "output_text", text: '{"reply":"Hello"}' }],
          },
        ],
      }),
    );
  });
  assert.deepEqual(
    await generateOpenAI(config, "system", "question", replySchema),
    { reply: "Hello" },
  );
});
test("OpenAI errors never expose provider body", async (t) => {
  t.mock.method(
    globalThis,
    "fetch",
    async () => new Response("secret error details", { status: 401 }),
  );
  await assert.rejects(
    generateOpenAI(config, "", "", replySchema),
    (e) =>
      e instanceof ProviderError &&
      e.code === "openai" &&
      !e.message.includes("secret"),
  );
});
