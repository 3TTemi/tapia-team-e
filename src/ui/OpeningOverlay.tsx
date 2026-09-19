import { openingCaptions, type OpeningShot } from "../world/openingTimeline";
import "./opening.css";

export default function OpeningOverlay({
  shot,
  onSkip,
}: {
  shot: OpeningShot;
  onSkip: () => void;
}) {
  const caption = openingCaptions[shot];
  return (
    <section
      className={`opening-overlay opening-${shot}`}
      aria-label="Opening cinematic"
    >
      <div className="opening-letterbox opening-letterbox-top" />
      <div className="opening-letterbox opening-letterbox-bottom" />
      <div className="opening-location">
        <span className="opening-live-dot" /> LAST COMMIT{" "}
        <span>/ PROLOGUE</span>
      </div>
      <button className="opening-skip" onClick={onSkip}>
        Skip intro <kbd>ESC</kbd>
      </button>
      <div
        className="opening-caption"
        key={shot}
        role="status"
        aria-live="polite"
      >
        <span>{caption.label}</span>
        {shot === "handoff" ? <h1>{caption.text}</h1> : <p>{caption.text}</p>}
      </div>
      <div className="opening-progress">
        <div />
      </div>
    </section>
  );
}
