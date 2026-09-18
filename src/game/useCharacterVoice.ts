import { useEffect, useRef, useState } from "react";
import { synthesizeSpeech } from "./voices";

export function useCharacterVoice(
  suspectId: string,
  onSpeaking?: (value: boolean) => void,
) {
  const [enabled, setEnabled] = useState(true);
  const enabledRef = useRef(true);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const player = useRef<HTMLAudioElement | null>(null);
  const pending = useRef<AbortController | null>(null);
  const cached = useRef<{ text: string; url: string } | null>(null);
  const mounted = useRef(true);
  const speakingCallback = useRef(onSpeaking);
  speakingCallback.current = onSpeaking;
  function stop() {
    pending.current?.abort();
    pending.current = null;
    if (player.current) {
      player.current.onended = null;
      player.current.onerror = null;
      player.current.pause();
      player.current = null;
    }
    if (mounted.current) {
      setPlaying(false);
      setLoading(false);
    }
    speakingCallback.current?.(false);
  }
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stop();
    };
  }, [suspectId]);
  async function speak(text: string, force = false) {
    if (!enabledRef.current && !force) return;
    stop();
    setError("");
    const controller = new AbortController();
    pending.current = controller;
    try {
      let url = cached.current?.text === text ? cached.current.url : undefined;
      if (!url) {
        setLoading(true);
        url = (await synthesizeSpeech(text, suspectId, controller.signal)).url;
      }
      if (!mounted.current || controller.signal.aborted) return;
      cached.current = { text, url };
      setLoading(false);
      const audio = new Audio(url);
      player.current = audio;
      audio.onended = () => {
        if (mounted.current) {
          setPlaying(false);
          speakingCallback.current?.(false);
        }
      };
      audio.onerror = () => {
        if (mounted.current) {
          setError("Audio could not play. Try replaying.");
          setPlaying(false);
          speakingCallback.current?.(false);
        }
      };
      try {
        await audio.play();
        if (mounted.current && !controller.signal.aborted) {
          setPlaying(true);
          speakingCallback.current?.(true);
        }
      } catch {
        if (!controller.signal.aborted && mounted.current)
          setError(
            "Playback blocked. Click Play / replay voice to start audio.",
          );
      }
    } catch (cause) {
      if (mounted.current && !controller.signal.aborted)
        setError(
          cause instanceof Error ? cause.message : "Voice service unavailable.",
        );
    } finally {
      if (mounted.current && !controller.signal.aborted) setLoading(false);
    }
  }
  return {
    enabled,
    loading,
    playing,
    error,
    stop,
    speak,
    toggle() {
      enabledRef.current = !enabledRef.current;
      setEnabled(enabledRef.current);
      if (!enabledRef.current) stop();
    },
    replay(text: string) {
      enabledRef.current = true;
      setEnabled(true);
      return speak(text, true);
    },
  };
}
