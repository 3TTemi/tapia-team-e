import { generateJSON, ProviderError, type AIConfig } from "./gemini";

export async function generateOpenAI(
  config: AIConfig,
  system: string,
  input: string,
  schema: object,
): Promise<unknown> {
  // Translate the simple Gemini response schema to strict JSON Schema.
  const shape = schema as {
    properties: Record<string, { type: string }>;
    required: string[];
  };
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.openaiApiKey}`,
    },
    signal: AbortSignal.timeout(8000),
    body: JSON.stringify({
      model: config.openaiModel || "gpt-4.1-mini",
      store: false,
      instructions: system,
      input,
      max_output_tokens: 1024,
      text: {
        format: {
          type: "json_schema",
          name: "character_response",
          strict: true,
          schema: {
            type: "object",
            properties: Object.fromEntries(
              Object.entries(shape.properties).map(([key, value]) => [
                key,
                { type: value.type.toLowerCase() },
              ]),
            ),
            required: shape.required,
            additionalProperties: false,
          },
        },
      },
    }),
  });
  if (!response.ok)
    throw new ProviderError(
      "openai",
      `OpenAI request failed (${response.status}).`,
    );
  const body = await response.json();
  if (body.status !== "completed")
    throw new ProviderError("openai", "OpenAI response was incomplete.");
  const text = body.output
    ?.filter((item: { type: string }) => item.type === "message")
    .flatMap(
      (item: { content: Array<{ type: string; text?: string }> }) =>
        item.content,
    )
    .filter((item: { type: string }) => item.type === "output_text")
    .map((item: { text: string }) => item.text)
    .join("");
  try {
    if (!text) throw new Error();
    return JSON.parse(text);
  } catch {
    throw new ProviderError(
      "openai",
      "OpenAI returned unusable structured output.",
    );
  }
}

/** Sticky within one interview: after failover the verifier also uses OpenAI. */
export function createGenerator(
  config: AIConfig,
  gemini = generateJSON,
  openai = generateOpenAI,
) {
  let provider: "gemini" | "openai" = config.apiKey ? "gemini" : "openai";
  return {
    get provider() {
      return provider;
    },
    async generate(
      c: AIConfig,
      system: string,
      input: string,
      schema: object,
    ): Promise<unknown> {
      if (provider === "gemini") {
        try {
          return await gemini(c, system, input, schema);
        } catch (error) {
          if (!c.openaiApiKey) throw error;
          provider = "openai";
        }
      }
      return openai(c, system, input, schema);
    },
  };
}
