import { useState } from "react";
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
  const [translated, setTranslated] = useState(false);
  const [large, setLarge] = useState(false);
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
      </div>
    </section>
  );
}
