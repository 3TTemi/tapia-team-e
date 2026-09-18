export interface AIConfig {
  apiKey: string;
  model: string;
  scripted: boolean;
}
export class ProviderError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export async function generateJSON(
  config: AIConfig,
  system: string,
  input: string,
  schema: object,
): Promise<unknown> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": config.apiKey,
      },
      signal: AbortSignal.timeout(12000),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: input }] }],
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 1024,
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      }),
    },
  );
  if (!response.ok) {
    // Never propagate provider bodies: they can contain request details or credentials.
    const code =
      response.status === 429
        ? "quota"
        : response.status === 404
          ? "model"
          : [400, 401, 403].includes(response.status)
            ? "access"
            : "provider";
    throw new ProviderError(
      code,
      `Gemini request failed (${response.status}).`,
    );
  }
  const body = await response.json();
  const candidate = body.candidates?.[0];
  if (candidate?.finishReason !== "STOP")
    throw new ProviderError(
      "response",
      "Gemini returned an incomplete or blocked answer.",
    );
  const output = candidate.content?.parts
    ?.filter(
      (p: { thought?: boolean; text?: string }) =>
        !p.thought && typeof p.text === "string",
    )
    .map((p: { text: string }) => p.text)
    .join("");
  if (!output)
    throw new ProviderError("response", "Gemini returned no dialogue.");
  try {
    return JSON.parse(output);
  } catch {
    throw new ProviderError(
      "response",
      "Gemini returned invalid dialogue data.",
    );
  }
}

export const replySchema = {
  type: "OBJECT",
  properties: { reply: { type: "STRING" } },
  required: ["reply"],
};
export const guardSchema = {
  type: "OBJECT",
  properties: { supported: { type: "BOOLEAN" } },
  required: ["supported"],
};
