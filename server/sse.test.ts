import test from "node:test";
import assert from "node:assert/strict";
import { parseSSE } from "./sse";

test("parseSSE extracts complete events and keeps partial buffer", () => {
  const first = parseSSE('event: token\ndata: {"delta":"Hi"}\n\n');
  assert.equal(first.events.length, 1);
  assert.equal(first.events[0]?.event, "token");
  assert.equal(first.events[0]?.data, '{"delta":"Hi"}');
  assert.equal(first.rest, "");

  const second = parseSSE(
    'event: start\ndata: {"mode":"openai"}\n\nevent: token\ndata: {"delta":" there"}\n\npartial',
  );
  assert.equal(second.events.length, 2);
  assert.equal(second.rest, "partial");
});
