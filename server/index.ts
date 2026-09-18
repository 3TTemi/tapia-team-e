import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

dotenv.config({ path: join(process.cwd(), ".env") });

const app = express();
app.use(express.json());

const VOICE_MAP: Record<string, string> = {
  alex: "Rachel",
  jordan: "Domi",
  sam: "Antoni",
};

app.post("/api/tts", async (req: Request, res: Response) => {
  try {
    const { text, suspectId } = req.body || {};
    if (!text || typeof text !== "string") {
      res.status(400).json({ error: "Missing text" });
      return;
    }
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key || key === "your_key_here") {
      res.status(503).json({ error: "11labs key not configured" });
      return;
    }
    const voiceName = VOICE_MAP[suspectId as string] || "Rachel";
    // Use 11labs library voice IDs directly (names are placeholders for real voice IDs)
    // Real integration would call https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream
    // and return the audio buffer/URL. This adapter returns a mock audio URL for wiring.
    const mockUrl = `/audio/${suspectId}-${Date.now()}.mp3`;
    res.json({ url: mockUrl, voice: voiceName, text });
  } catch (e) {
    console.error("TTS error:", e);
    res.status(500).json({ error: "TTS failed" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Voice adapter running on http://localhost:${PORT}`);
});
