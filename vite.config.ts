import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { createApi } from "./server/api";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const api = createApi(() => ({
    apiKey: process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || "",
    model: process.env.GEMINI_MODEL || env.GEMINI_MODEL || "gemini-3.8-flash",
    scripted: (process.env.DIALOGUE_MODE || env.DIALOGUE_MODE) === "scripted",
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
