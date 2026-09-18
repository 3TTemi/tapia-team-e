import { loadEnv } from "vite";
import { generateJSON, ProviderError, replySchema } from "../server/gemini";
const env = loadEnv("development", process.cwd(), "");
const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;
const model =
  process.env.GEMINI_MODEL || env.GEMINI_MODEL || "gemini-3.8-flash";
if (!apiKey) {
  console.error(
    "No GEMINI_API_KEY configured. Add it to .env, then run npm run ai:check.",
  );
  process.exitCode = 1;
} else {
  try {
    await generateJSON(
      { apiKey, model, scripted: false },
      "Return JSON with reply set to Connected.",
      "Connection test.",
      replySchema,
    );
    console.log(`Gemini connection verified: ${model}`);
  } catch (error) {
    console.error(
      `Gemini connection failed (${error instanceof ProviderError ? error.code : "connection"}). Check key, model access, and quota. No credentials were printed.`,
    );
    process.exitCode = 1;
  }
}
