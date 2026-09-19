import { useState } from "react";
import { clues, suspects } from "../game/case";
import type { CaseDecision, CaseVerdict } from "../game/submission";
import type { SaveGame, SuspectId } from "../game/types";
import "./case-submission.css";

export default function CaseSubmission({
  game,
  onConfirm,
  onClose,
}: {
  game: SaveGame;
  onConfirm: (suspect: SuspectId) => CaseDecision;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<SuspectId | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  return (
    <section
      className="panel case-submission"
      role="dialog"
      aria-modal="true"
      aria-label="Submit case"
    >
      <div className="panel-top">
        <span className="eyebrow">CASE 001 / FINAL REVIEW</span>
        <button onClick={onClose} aria-label="Close case submission">
          ✕
        </button>
      </div>
      <h2>Who planned the robbery?</h2>
      <p className="muted">
        Choose the person who arranged the cash pickup. Their other secrets are
        not proof of this robbery.
      </p>
      <fieldset className="case-suspects">
        <legend>Choose one suspect</legend>
        {suspects.map((suspect) => (
          <label
            key={suspect.id}
            className={`case-suspect ${selected === suspect.id ? "selected" : ""}`}
          >
            <input
              type="radio"
              name="case-suspect"
              value={suspect.id}
              checked={selected === suspect.id}
              onChange={() => {
                setSelected(suspect.id);
                setMissing([]);
              }}
            />
            <span
              className="case-portrait"
              style={{ color: suspect.color }}
              aria-hidden="true"
            >
              {suspect.name[0]}
            </span>
            <strong>{suspect.name}</strong>
            <span className="case-role">{suspect.role}</span>
          </label>
        ))}
      </fieldset>
      <p className="case-attachments">
        {game.clues.length} collected{" "}
        {game.clues.length === 1 ? "clue" : "clues"} will be attached
        automatically.
      </p>
      {missing.length > 0 && (
        <div className="hint-box" role="status">
          <strong>More evidence needed.</strong> No verdict has been made. Find{" "}
          {missing.join(" and ")} before submitting your case.
        </div>
      )}
      <button
        className="primary"
        disabled={!selected}
        onClick={() => {
          if (!selected) return;
          const decision = onConfirm(selected);
          if (decision.status === "insufficient-evidence")
            setMissing(
              decision.missing.map((id) =>
                clues.find((clue) => clue.id === id)!.title.toLowerCase(),
              ),
            );
        }}
      >
        Confirm accusation <span aria-hidden="true">↗</span>
      </button>
      <button className="text-button case-return" onClick={onClose}>
        Keep investigating
      </button>
    </section>
  );
}

export function CaseRetry({
  suspectId,
  onRetry,
  onClose,
}: {
  suspectId: SuspectId;
  onRetry: () => void;
  onClose: () => void;
}) {
  const name = suspects.find((suspect) => suspect.id === suspectId)!.name;
  return (
    <section
      className="panel case-submission"
      role="dialog"
      aria-modal="true"
      aria-label="Accusation not supported"
    >
      <div className="panel-top">
        <span className="eyebrow">CASE STILL OPEN</span>
        <button onClick={onClose} aria-label="Return to investigation">
          ✕
        </button>
      </div>
      <h2>That accusation doesn’t hold.</h2>
      <p>
        The records do not establish that {name} arranged the cash pickup.
        Review who accessed the security desk and who booked the runner.
      </p>
      <div className="hint-box">
        Your evidence, interviews, and board connections are saved. You can
        reconsider your choice.
      </div>
      <button className="primary" onClick={onRetry}>
        Choose another suspect <span>↗</span>
      </button>
      <button className="text-button case-return" onClick={onClose}>
        Return to investigation
      </button>
    </section>
  );
}

export function VerdictOverlay({ verdict }: { verdict: CaseVerdict }) {
  const solved = verdict.status === "solved";
  return (
    <section
      className={`case-verdict ${solved ? "case-verdict-solved" : "case-verdict-wrong"}`}
      aria-label="Case verdict"
      role="status"
    >
      <div className="case-verdict-content">
        <span className="eyebrow">CASE 001 / FINAL REVIEW</span>
        <div className="case-verdict-mark" aria-hidden="true">
          {solved ? "✓" : "×"}
        </div>
        <h1>{solved ? "Case closed." : "Case still open."}</h1>
        <p>
          {solved
            ? "Two records. One mastermind. Sam arranged the pickup."
            : "The accusation does not match the evidence."}
        </p>
        <div className="case-verdict-progress" />
      </div>
    </section>
  );
}
