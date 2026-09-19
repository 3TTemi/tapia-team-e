import type { AIConfig } from "./gemini";
import { ProviderError } from "./gemini";

async function readProviderSSE(
  response: Response,
  onChunk: (delta: string) => void,
): Promise<string> {
  if (!response.body) {
    throw new ProviderError("response", "Provider returned no stream body.");
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";
    for (const block of blocks) {
      for (const line of block.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        let parsed: unknown;
        try {
          parsed = JSON.parse(payload);
        } catch {
          continue;
        }
        const record = parsed as {
          choices?: { delta?: { content?: string } }[];
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };
        const openaiDelta = record.choices?.[0]?.delta?.content;
        const geminiDelta = record.candidates?.[0]?.content?.parts?.[0]?.text;
        const delta =
          typeof openaiDelta === "string"
            ? openaiDelta
            : typeof geminiDelta === "string"
              ? geminiDelta
              : "";
        if (!delta) continue;
        full += delta;
        onChunk(delta);
      }
    }
  }
  return full.trim();
}

async function streamOpenAIReply(
  config: AIConfig,
  system: string,
  input: string,
  onDelta: (delta: string) => void,
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.openaiApiKey}`,
    },
    signal: AbortSignal.timeout(30000),
    body: JSON.stringify({
      model: config.openaiModel || "gpt-4.1-mini",
      temperature: 0.35,
      max_tokens: 1024,
      stream: true,
      messages: [
        { role: "system", content: system },
        { role: "user", content: input },
      ],
    }),
  });
  if (!response.ok) {
    throw new ProviderError(
      "openai",
      `OpenAI request failed (${response.status}).`,
    );
  }
  const text = await readProviderSSE(response, onDelta);
  if (!text) throw new ProviderError("openai", "OpenAI returned no dialogue.");
  return text;
}

async function streamGeminiReply(
  config: AIConfig,
  system: string,
  input: string,
  onDelta: (delta: string) => void,
): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.model)}:streamGenerateContent?alt=sse`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": config.apiKey,
      },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: input }] }],
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 1024,
        },
      }),
    },
  );
  if (!response.ok) {
    const code =
      response.status === 429
        ? "quota"
        : response.status === 404
          ? "model"
          : [400, 401, 403].includes(response.status)
            ? "access"
            : "provider";
    throw new ProviderError(code, `Gemini request failed (${response.status}).`);
  }
  const text = await readProviderSSE(response, onDelta);
  if (!text) throw new ProviderError("response", "Gemini returned no dialogue.");
  return text;
}

/** Gemini-first with OpenAI backup, matching createGenerator routing. */
export async function streamReplyText(
  config: AIConfig,
  system: string,
  input: string,
  onDelta: (delta: string) => void,
): Promise<{ text: string; provider: "openai" | "gemini" }> {
  if (config.apiKey) {
    try {
      return {
        text: await streamGeminiReply(config, system, input, onDelta),
        provider: "gemini",
      };
    } catch (error) {
      if (!config.openaiApiKey) throw error;
    }
  }
  if (!config.openaiApiKey) {
    throw new ProviderError(
      "access",
      "No configured API key for live streaming.",
    );
  }
  return {
    text: await streamOpenAIReply(config, system, input, onDelta),
    provider: "openai",
  };
}

export async function emitScriptedStream(
  text: string,
  onDelta: (delta: string) => void | Promise<void>,
  delayMs = 28,
): Promise<string> {
  const parts = text.match(/\S+\s*|\s+/g) ?? [text];
  let full = "";
  for (const part of parts) {
    full += part;
    await onDelta(part);
    if (delayMs > 0) await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return full.trim();
}
