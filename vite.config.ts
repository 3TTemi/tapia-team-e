import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { createApi } from "./server/api";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const api = createApi(() => ({
    apiKey:
      (process.env.AI_PROVIDER || env.AI_PROVIDER || "openai") === "gemini"
        ? process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || ""
        : "",
    model: process.env.GEMINI_MODEL || env.GEMINI_MODEL || "gemini-3.8-flash",
    openaiApiKey: process.env.OPENAI_API_KEY || env.OPENAI_API_KEY || "",
    openaiModel: process.env.OPENAI_MODEL || env.OPENAI_MODEL || "gpt-4.1-mini",
    scripted: (process.env.DIALOGUE_MODE || env.DIALOGUE_MODE) === "scripted",
    elevenLabsApiKey:
      process.env.ELEVENLABS_API_KEY || env.ELEVENLABS_API_KEY || "",
    elevenLabsModel:
      process.env.ELEVENLABS_MODEL_ID ||
      env.ELEVENLABS_MODEL_ID ||
      "eleven_multilingual_v2",
    elevenLabsVoiceIds: {
      alex:
        process.env.ELEVENLABS_ALEX_VOICE_ID ||
        env.ELEVENLABS_ALEX_VOICE_ID ||
        "",
      jordan:
        process.env.ELEVENLABS_JORDAN_VOICE_ID ||
        env.ELEVENLABS_JORDAN_VOICE_ID ||
        "",
      sam:
        process.env.ELEVENLABS_SAM_VOICE_ID ||
        env.ELEVENLABS_SAM_VOICE_ID ||
        "",
    },
  }));
  return {
    plugins: [
      react(),
      {
        name: "local-character-api",
        configureServer(server) {
          server.middlewares.use(api);
        },
        configurePreviewServer(server) {
          server.middlewares.use(api);
        },
      },
    ],
  };
});
