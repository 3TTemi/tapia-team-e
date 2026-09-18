export async function synthesizeSpeech(
  text: string,
  suspectId: string,
  signal?: AbortSignal,
): Promise<{ url: string }> {
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, suspectId }),
    signal,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "TTS error" }));
    throw new Error(err.error || "TTS failed");
  }
  return res.json();
}
