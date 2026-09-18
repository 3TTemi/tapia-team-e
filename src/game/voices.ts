export const VOICE_MAP: Record<string, string> = {
  alex: "Rachel",
  jordan: "Domi",
  sam: "Antoni",
};

export async function synthesizeSpeech(
  text: string,
  suspectId: string,
): Promise<{ url: string; voice: string }> {
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, suspectId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "TTS error" }));
    throw new Error(err.error || "TTS failed");
  }
  return res.json();
}
