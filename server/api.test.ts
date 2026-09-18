import test from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { createApi } from "./api";
import { newSession, type Session } from "./store";

test("voice endpoint returns real audio data and reports missing voice configuration", async (t) => {
  let providerCalls = 0;
  t.mock.method(globalThis, "fetch", async (_url, options) => {
    providerCalls++;
    assert.equal(JSON.parse(String(options?.body)).text, "Hello detective.");
    return new Response(new Uint8Array([73, 68, 51]), {
      headers: { "Content-Type": "audio/mpeg" },
    });
  });
  const api = createApi(() => ({
    apiKey: "",
    model: "offline",
    scripted: true,
    elevenLabsApiKey: "test-key",
    elevenLabsVoiceIds: { alex: "test-voice" },
  }));
  async function request(suspectId: string) {
    const req = Readable.from([
      JSON.stringify({ suspectId, text: "Hello detective." }),
    ]) as IncomingMessage;
    req.method = "POST";
    req.url = "/api/tts";
    req.headers = {};
    let status = 0;
    let body = "";
    const res = {
      writeHead(code: number) {
        status = code;
      },
      end(value: string) {
        body = value;
      },
    } as unknown as ServerResponse;
    await api(req, res, () => assert.fail());
    return { status, body: JSON.parse(body) };
  }
  const valid = await request("alex");
  assert.equal(valid.status, 200);
  assert.equal(valid.body.url, "data:audio/mpeg;base64,SUQz");
  const missing = await request("jordan");
  assert.equal(missing.status, 503);
  assert.match(missing.body.error, /voice ID/);
  assert.equal((await request("unknown")).status, 400);
  assert.equal(providerCalls, 1);
});

test("three-marker inventory is accepted and its pickup file presents both proof records", async () => {
  let saved: Session | undefined;
  const api = createApi(
    () => ({ apiKey: "", model: "offline", scripted: true }),
    {
      lock: () => true,
      unlock: () => {},
      read: async () => newSession(),
      write: async (_id, value) => {
        saved = value;
      },
    },
  );
  async function request(collectedClues: string[]) {
    const req = Readable.from([
      JSON.stringify({
        sessionId: randomUUID(),
        suspectId: "sam",
        message: "Explain this pickup file.",
        collectedClues,
        presentedClue: "heat",
        stream: false,
      }),
    ]) as IncomingMessage;
    req.method = "POST";
    req.url = "/api/interview";
    req.headers = {};
    let status = 0;
    let body = "";
    const res = {
      writeHead(code: number) {
        status = code;
      },
      end(value: string) {
        body = value;
      },
    } as unknown as ServerResponse;
    await api(req, res, () => assert.fail("Unexpected next handler"));
    return { status, body: JSON.parse(body) };
  }
  const valid = await request(["log", "photo", "badge", "heat"]);
  assert.equal(valid.status, 200);
  assert.match(valid.body.text, /I planned the robbery/);
  assert.deepEqual(saved?.characters.sam.presented, ["badge", "heat"]);
  assert.equal((await request(["heat"])).status, 400);
  assert.equal((await request(["badge", "heat", "fabricated"])).status, 400);
});
