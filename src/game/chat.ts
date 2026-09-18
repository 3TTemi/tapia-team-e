import type { ClueId, Message, SuspectId } from "./types";

const KEY = "last-commit-interview-session-v2";
let sessionId: string | undefined;
function session() {
  if (sessionId) return sessionId;
  try {
    const saved = localStorage.getItem(KEY);
    if (saved && /^[a-f0-9-]{36}$/.test(saved)) sessionId = saved;
  } catch {
    /* memory-only browser */
  }
  if (!sessionId) sessionId = crypto.randomUUID();
  try {
    localStorage.setItem(KEY, sessionId);
  } catch {
    /* memory-only browser */
  }
  return sessionId;
}
export function resetInterviews() {
  sessionId = crypto.randomUUID();
  try {
    localStorage.setItem(KEY, sessionId);
  } catch {
    /* memory-only browser */
  }
}
export interface ChatStatus {
  mode: "openai" | "gemini" | "scripted";
  model: string;
  configured: boolean;
  backupConfigured?: boolean;
  streaming?: boolean;
}
export interface ChatReply {
  text: string;
  mode: "openai" | "gemini" | "scripted" | "guarded";
  notice?: string;
  history: Message[];
}

type InterviewPayload = {
  suspectId: SuspectId;
  message: string;
  presentedClue?: ClueId;
  collectedClues: ClueId[];
};

function parseSSEBlock(block: string) {
  let event = "message";
  const dataLines: string[] = [];
  for (const line of block.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
  }
  if (!dataLines.length) return null;
  return { event, data: dataLines.join("\n") };
}

export async function getChatStatus(): Promise<ChatStatus> {
  const response = await fetch("/api/status", {
    signal: AbortSignal.timeout(4000),
  });
  if (!response.ok)
    throw new Error(
      "Chat service is unavailable. Start the game with npm run dev or npm run preview.",
    );
  return response.json();
}

export async function requestInterviewStream(
  input: InterviewPayload,
  handlers: {
    onStart?: (info: { mode: ChatReply["mode"] }) => void;
    onToken: (text: string) => void;
    onReplace?: (text: string, notice?: string) => void;
  },
): Promise<ChatReply> {
  const response = await fetch("/api/interview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, sessionId: session(), stream: true }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.error || "Chat service unavailable. Run npm run dev, then retry.",
    );
  }
  if (!response.body) throw new Error("Streaming response was empty.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalReply: ChatReply | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    while (true) {
      const split = buffer.indexOf("\n\n");
      if (split === -1) break;
      const block = buffer.slice(0, split);
      buffer = buffer.slice(split + 2);
      const parsed = parseSSEBlock(block);
      if (!parsed) continue;
      let payload: Record<string, unknown>;
      try {
        payload = JSON.parse(parsed.data);
      } catch {
        continue;
      }
      if (parsed.event === "start") {
        handlers.onStart?.({ mode: payload.mode as ChatReply["mode"] });
      } else if (parsed.event === "token" && typeof payload.text === "string") {
        handlers.onToken(payload.text);
      } else if (
        parsed.event === "replace" &&
        typeof payload.text === "string"
      ) {
        handlers.onReplace?.(
          payload.text,
          typeof payload.notice === "string" ? payload.notice : undefined,
        );
        handlers.onToken(payload.text);
      } else if (parsed.event === "done") {
        finalReply = payload as unknown as ChatReply;
      } else if (parsed.event === "error") {
        throw new Error(
          typeof payload.error === "string"
            ? payload.error
            : "The character could not respond. Please retry.",
        );
      }
    }
  }

  if (!finalReply?.history) {
    throw new Error("The interview stream ended before a reply was saved.");
  }
  return finalReply;
}

export async function requestInterview(
  input: InterviewPayload,
): Promise<ChatReply> {
  const response = await fetch("/api/interview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, sessionId: session(), stream: false }),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.error || "Chat service unavailable. Run npm run dev, then retry.",
    );
  }
  return response.json();
}
