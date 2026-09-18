import type { IncomingMessage, ServerResponse } from "node:http";
import { clues, characters } from "../src/game/case";
import type { ClueId, SuspectId } from "../src/game/types";
import { interview } from "./interview";
import { createStore } from "./store";
import type { AIConfig } from "./gemini";

export function createApi(config: () => AIConfig) {
  const store = createStore();
  const send = (res: ServerResponse, status: number, body: unknown) => {
    res.writeHead(status, {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    });
    res.end(JSON.stringify(body));
  };
  return async (
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void,
  ) => {
    const route = req.url?.split("?")[0];
    if (!route?.startsWith("/api/")) return next();
    // Same-origin localhost service; no cross-origin API access.
    if (req.headers.origin) {
      try {
        if (new URL(req.headers.origin).host !== req.headers.host) {
          send(res, 403, { error: "Cross-origin requests are not allowed." });
          return;
        }
      } catch {
        send(res, 403, { error: "Invalid origin." });
        return;
      }
    }
    if (route === "/api/status" && req.method === "GET") {
      const c = config();
      send(res, 200, {
        mode: c.scripted
          ? "scripted"
          : c.apiKey
            ? "gemini"
            : c.openaiApiKey
              ? "openai"
              : "scripted",
        model: c.model,
        configured: !!(c.apiKey || c.openaiApiKey),
        backupConfigured: !!c.openaiApiKey,
      });
      return;
    }
    if (route !== "/api/interview" || req.method !== "POST") {
      send(res, 404, { error: "Unknown endpoint." });
      return;
    }
    let id: string | undefined;
    let locked = false;
    try {
      let raw = "";
      for await (const chunk of req) {
        raw += chunk.toString();
        if (Buffer.byteLength(raw) > 8192) {
          send(res, 413, { error: "Question is too large." });
          return;
        }
      }
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        send(res, 400, { error: "Invalid JSON." });
        return;
      }
      if (
        !data ||
        typeof data !== "object" ||
        typeof data.sessionId !== "string" ||
        !/^[a-f0-9-]{36}$/.test(data.sessionId) ||
        !characters.some((s) => s.id === data.suspectId) ||
        typeof data.message !== "string" ||
        !data.message.trim() ||
        data.message.length > 500 ||
        !Array.isArray(data.collectedClues) ||
        data.collectedClues.length > 5 ||
        !data.collectedClues.every((c: unknown) =>
          clues.some((known) => known.id === c),
        ) ||
        (data.presentedClue !== undefined &&
          !clues.some((c) => c.id === data.presentedClue))
      ) {
        send(res, 400, { error: "Invalid interview request." });
        return;
      }
      if (
        data.presentedClue &&
        !data.collectedClues.includes(data.presentedClue)
      ) {
        send(res, 400, {
          error: "Collect this evidence before presenting it.",
        });
        return;
      }
      id = data.sessionId;
      if (!store.lock(id!)) {
        send(res, 409, {
          error: "A reply is already being generated. Please wait.",
        });
        return;
      }
      locked = true;
      const session = await store.read(id!);
      // This is a local single-player prototype. The client reports collected clues;
      // the server owns each NPC's presented evidence and private transcript.
      session.collected = [
        ...new Set([...session.collected, ...data.collectedClues]),
      ] as ClueId[];
      const suspectId = data.suspectId as SuspectId;
      const result = await interview(
        {
          suspectId,
          message: data.message.trim(),
          presentedClue: data.presentedClue,
        },
        session.characters[suspectId],
        config(),
      );
      await store.write(id!, session);
      send(res, 200, {
        ...result,
        history: session.characters[suspectId].history,
      });
    } catch {
      send(res, 500, {
        error:
          "The local interview service could not save this turn. Please retry.",
      });
    } finally {
      if (locked && id) store.unlock(id);
    }
  };
}
