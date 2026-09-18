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
}
export interface ChatReply {
  text: string;
  translation?: string;
  mode: "openai" | "gemini" | "scripted" | "guarded";
  notice?: string;
  history: Message[];
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
export async function requestInterview(input: {
  suspectId: SuspectId;
  message: string;
  presentedClue?: ClueId;
  collectedClues: ClueId[];
}): Promise<ChatReply> {
  const response = await fetch("/api/interview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, sessionId: session() }),
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
