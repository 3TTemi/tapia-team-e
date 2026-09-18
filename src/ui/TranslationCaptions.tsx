import { useEffect, useState } from "react";
import "./translation.css";
export default function TranslationCaptions({
  spanish,
  english,
  busy,
}: {
  spanish: string;
  english: string;
  busy: boolean;
}) {
  const [audio, setAudio] = useState(false);
  const [translated, setTranslated] = useState(false);
  const [large, setLarge] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [audioError, setAudioError] = useState("");
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const update = () =>
      setVoices(
        window.speechSynthesis
          .getVoices()
          .filter((v) => v.lang.toLowerCase().startsWith("es")),
      );
    update();
    window.speechSynthesis.addEventListener("voiceschanged", update);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", update);
      window.speechSynthesis.cancel();
    };
  }, []);
  useEffect(() => {
    if (!audio || busy || !voices.length) return;
    const speech = new SpeechSynthesisUtterance(spanish);
    speech.lang = voices[0].lang;
    speech.voice = voices[0];
    speech.rate = 0.94;
    speech.onerror = () =>
      setAudioError("Audio unavailable. Captions remain on.");
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
    return () => window.speechSynthesis.cancel();
  }, [spanish, audio, busy, voices]);
  return (
    <section
      className={`translation-captions ${large ? "large" : ""}`}
      aria-label={
        translated
          ? "Spanish to English translation"
          : "Gabby’s Spanish dialogue"
      }
    >
      <div className="translation-status">
        <span aria-hidden="true">◉</span>{" "}
        {translated
          ? "Accessibility mode · Translation on"
          : "Gabby · Spanish dialogue"}
        <span>{translated ? "ES → EN" : "ES"}</span>
      </div>
      <div aria-live="polite" aria-atomic="true">
        <p className="translation-source" lang="es">
          <strong>Gabby · Español</strong>
          {busy ? "Preparando respuesta…" : spanish}
        </p>
        {translated && (
          <p
            id="english-witness-captions"
            className="translation-english"
            lang="en"
          >
            <strong>English captions</strong>
            {busy ? "Preparing translated reply…" : english}
          </p>
        )}
      </div>
      <div className="translation-controls">
        <button
          aria-expanded={translated}
          aria-controls="english-witness-captions"
          onClick={() => setTranslated((value) => !value)}
        >
          {translated ? "Turn translation off" : "Translate to English"}
        </button>
        {translated && (
          <button aria-pressed={large} onClick={() => setLarge((v) => !v)}>
            Larger captions {large ? "on" : "off"}
          </button>
        )}
        <button
          aria-pressed={audio}
          disabled={!voices.length}
          onClick={() => {
            setAudioError("");
            setAudio((v) => !v);
          }}
        >
          {audio ? "Mute Spanish voice" : "Play Spanish voice"}
        </button>
        <small>
          {audioError ||
            (voices.length
              ? "Browser voice · captions stay on"
              : "No Spanish voice installed · captions available")}
        </small>
      </div>
    </section>
  );
}
