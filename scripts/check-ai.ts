import { loadEnv } from "vite";
import { ProviderError, replySchema } from "../server/gemini";
import { createGenerator } from "../server/providers";
const env = loadEnv("development", process.cwd(), "");
const config = {
  apiKey: process.argv.includes("--openai")
    ? ""
    : process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || "",
  model: process.env.GEMINI_MODEL || env.GEMINI_MODEL || "gemini-3.8-flash",
  openaiApiKey: process.env.OPENAI_API_KEY || env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || env.OPENAI_MODEL || "gpt-4.1-mini",
  scripted: false,
};
if (!config.apiKey && !config.openaiApiKey) {
  console.error("No configured API key for this check. Add it to .env.");
  process.exitCode = 1;
} else {
  const router = createGenerator(config);
  try {
    await router.generate(
      config,
      "Return JSON with reply set to Connected.",
      "Connection test.",
      replySchema,
    );
    console.log(
      `Connection verified: ${router.provider} / ${router.provider === "openai" ? config.openaiModel : config.model}`,
    );
  } catch (error) {
    console.error(
      `Connection failed: ${error instanceof ProviderError ? error.message : "Network failure or timeout."} No credentials printed.`,
    );
    process.exitCode = 1;
  }
}
