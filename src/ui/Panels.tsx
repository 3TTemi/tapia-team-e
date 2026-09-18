import TranslationCaptions from "./TranslationCaptions";
import { useEffect, useRef, useState } from "react";
import { clues, suspects, witnessOpeningTranslation } from "../game/case";
import { RECOMMENDED_CLUES, SAM_DEMO_QUESTION } from "../game/demo";
import { evaluateAccusation } from "../game/dialogue";
import {
  getChatStatus,
  requestInterview,
  requestInterviewStream,
} from "../game/chat";
import { useCharacterVoice } from "../game/useCharacterVoice";
import type {
  Clue,
  ClueId,
  Message,
  SaveGame,
  Suspect,
  SuspectId,
} from "../game/types";

export function CaseBrief({
  resume,
  hasSave,
  onWatchOpening,
  onStartDemo,
}: {
  resume: () => void;
  hasSave: boolean;
  onWatchOpening: () => void;
  onStartDemo: () => void;
}) {
  return (
    <section className="brief">
      <div className="eyebrow">
        <span className="status-dot" /> AN AFTER-HOURS MYSTERY
      </div>
      <h1>
        LAST
        <br />
        <span>COMMIT.</span>
      </h1>
      <p className="brief-lead">
        One bank robbery.
        <br />
        Three people with something to hide.
      </p>
      <p className="brief-copy">
        An alarm breaks the quiet outside the café. The bank’s cash is gone.
        Three witnesses are hiding something. Find out whose secret explains the
        robbery.
      </p>
      <button className="primary start-button" onClick={resume}>
        {hasSave ? "Continue investigation" : "Enter the café"} <span>↗</span>
      </button>
      <button className="demo-start-button" onClick={onStartDemo}>
        Start 90s demo <span>↗ reset · opening · guide</span>
      </button>
      {hasSave && (
        <button className="text-button opening-replay" onClick={onWatchOpening}>
          Watch opening again <span>10 seconds</span>
        </button>
      )}
      <div className="brief-controls">
        <span>
          <kbd>W A S D</kbd> move
        </span>
        <span>
          <kbd>MOUSE</kbd> look
        </span>
        <span>
          <kbd>E</kbd> interact
        </span>
      </div>
      <div className="prototype-note">
        PLAYABLE PROTOTYPE 01 <span>·</span> THREE WITNESSES. THREE SECRETS.
      </div>
    </section>
  );
}

export function CluePanel({
  clue,
  onClose,
}: {
  clue: Clue;
  onClose: () => void;
}) {
  return (
    <section
      className="panel clue-panel"
      role="dialog"
      aria-modal="true"
      aria-label={clue.title}
    >
      <div className="panel-top">
        <span className="eyebrow">EVIDENCE FILED</span>
        <button onClick={onClose} aria-label="Close evidence">
          ✕
        </button>
      </div>
      <div className="evidence-art">
        {clue.icon}
        <span>EXHIBIT {String(clues.indexOf(clue) + 1).padStart(2, "0")}</span>
      </div>
      <p className="eyebrow muted">{clue.category}</p>
      <h2>{clue.title}</h2>
      <p className="clue-description">{clue.description}</p>
      <div className="hint-box">
        Added to your notebook. Present this to a suspect to challenge their
        story.
      </div>
      <button className="primary" onClick={onClose}>
        Back to the room <span>↗</span>
      </button>
    </section>
  );
}

export function DialogueHud({
  suspect,
  game,
  demoMode,
  onMessages,
  onClose,
  onThinking,
  onStreamText,
  onStreaming,
  onVoiceSpeaking,
}: {
  suspect: Suspect;
  game: SaveGame;
  demoMode?: boolean;
  onMessages: (id: SuspectId, messages: Message[]) => void;
  onClose: () => void;
  onThinking: (thinking: boolean) => void;
  onStreamText: (text: string | null) => void;
  onStreaming: (streaming: boolean) => void;
  onVoiceSpeaking?: (speaking: boolean) => void;
}) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("Connecting…");
  const [notice, setNotice] = useState("");
  const field = useRef<HTMLInputElement>(null);
  const voice = useCharacterVoice(suspect.id, onVoiceSpeaking);
  useEffect(() => {
    let active = true;
    getChatStatus()
      .then((status) => {
        if (active)
          setMode(
            status.mode === "gemini"
              ? "Gemini ready"
              : status.mode === "openai"
                ? "OpenAI ready"
                : "Scripted mode",
          );
      })
      .catch(() => {
        if (active) setMode("Service unavailable");
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    field.current?.focus();
  }, [suspect.id]);
  async function send(message: string, presentedClue?: ClueId) {
    if (busy || !message.trim()) return;
    voice.stop();
    setBusy(true);
    onThinking(true);
    onStreaming(true);
    onStreamText("");
    setError("");
    try {
      const reply =
        suspect.id === "lucia"
          ? await requestInterview({
              suspectId: suspect.id,
              message,
              presentedClue,
              collectedClues: game.clues,
            })
          : await requestInterviewStream(
              {
                suspectId: suspect.id,
                message,
                presentedClue,
                collectedClues: game.clues,
              },
              {
                onToken: (text) => {
                  if (text) onThinking(false);
                  onStreamText(text);
                },
                onReplace: (text, notice) => {
                  onStreamText(text);
                  if (notice) setNotice(notice);
                },
              },
            );
      onMessages(suspect.id, reply.history);
      setMode(
        reply.mode === "openai"
          ? "OpenAI live"
          : reply.mode === "gemini"
            ? "Gemini live"
            : reply.mode === "guarded"
              ? "Authored · fact-check fallback"
              : "Scripted mode",
      );
      setNotice(reply.notice ?? "");
      setInput("");
      if (suspect.id !== "lucia") void voice.speak(reply.text);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The character could not respond. Please retry.",
      );
    } finally {
      setBusy(false);
      onThinking(false);
      onStreaming(false);
      onStreamText(null);
      field.current?.focus();
    }
  }
  const lastWitnessReply = [...game.histories[suspect.id]]
    .reverse()
    .find((m) => m.role === "suspect");
  const recommended = new Set(RECOMMENDED_CLUES[suspect.id]);
  const collected = clues
    .filter((c) => game.clues.includes(c.id))
    .sort(
      (a, b) =>
        Number(recommended.has(b.id)) - Number(recommended.has(a.id)) ||
        clues.indexOf(a) - clues.indexOf(b),
    );
  const demoPrompt =
    demoMode && suspect.id === "sam" && !game.histories.sam.length
      ? SAM_DEMO_QUESTION
      : "";
  useEffect(() => {
    if (demoPrompt) setInput(demoPrompt);
  }, [demoPrompt]);
  return (
    <>
      <aside
        className="dialogue-hud"
        aria-label={`Talking with ${suspect.name}`}
      >
        {suspect.id !== "lucia" && (
          <div className="voice-controls" aria-live="polite">
            <button
              type="button"
              onClick={voice.toggle}
              aria-pressed={voice.enabled}
            >
              {voice.enabled ? "Mute voice" : "Enable voice"}
            </button>
            <button
              type="button"
              disabled={busy || voice.loading}
              onClick={() =>
                void voice.replay(lastWitnessReply?.text ?? suspect.opening)
              }
            >
              {voice.loading ? "Preparing voice…" : "Play / replay voice"}
            </button>
            <small>
              {voice.error ||
                (voice.playing ? "Speaking · ElevenLabs" : "ElevenLabs voice")}
            </small>
          </div>
        )}
        <div className="dialogue-hud-top">
          <span>
            <strong>{suspect.name}</strong>
            <span className="muted">
              {" "}
              · {suspect.role.toLowerCase()} · {mode}
            </span>
          </span>
          <button className="dialogue-hud-leave" onClick={onClose}>
            Walk away
          </button>
        </div>
        {demoMode && recommended.size > 0 && (
          <p className="dialogue-hud-demo muted">
            Present highlighted evidence — skip typing unless prompted.
          </p>
        )}
        {suspect.id === "lucia" && (
          <button
            className="chip"
            disabled={busy}
            onClick={() => send("What did you see outside the bank?")}
          >
            Ask what she saw · Preguntar qué vio
          </button>
        )}
        {suspect.id !== "lucia" && collected.length > 0 && (
          <div className="chip-row">
            {collected.map((c) => (
              <button
                disabled={busy}
                className={
                  recommended.has(c.id) ? "chip chip-suggested" : "chip"
                }
                key={c.id}
                onClick={() => send(`Explain this: ${c.title}.`, c.id)}
              >
                {c.icon} {c.title}
              </button>
            ))}
          </div>
        )}
        {notice && <p className="dialogue-hud-notice muted">{notice}</p>}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <form
          className="question-form"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <input
            ref={field}
            aria-label="Your question"
            placeholder={
              suspect.id === "lucia"
                ? "Ask in English or Spanish…"
                : `Talk to ${suspect.name}…`
            }
            maxLength={500}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                onClose();
              }
            }}
          />
          <button
            className="primary"
            disabled={busy || !input.trim()}
            type="submit"
          >
            Ask
          </button>
        </form>
      </aside>
      {suspect.id === "lucia" && (
        <TranslationCaptions
          spanish={lastWitnessReply?.text ?? suspect.opening}
          english={
            lastWitnessReply
              ? (lastWitnessReply.translation ??
                "Translation unavailable for this saved reply. Ask again.")
              : witnessOpeningTranslation
          }
          busy={busy}
        />
      )}
    </>
  );
}

export function Notebook({
  game,
  onClose,
  onAccuse,
  onReset,
}: {
  game: SaveGame;
  onClose: () => void;
  onAccuse: () => void;
  onReset: () => void;
}) {
  return (
    <section
      className="panel notebook"
      role="dialog"
      aria-modal="true"
      aria-label="Case notebook"
    >
      <div className="panel-top">
        <span className="eyebrow">CASE 001 / FIELD NOTES</span>
        <button onClick={onClose} aria-label="Close notebook">
          ✕
        </button>
      </div>
      <h2>Follow the evidence.</h2>
      <p className="muted">Separate what people say from what you can prove.</p>
      <div className="notebook-grid">
        {clues.map((c, i) => (
          <article
            key={c.id}
            className={
              game.clues.includes(c.id) ? "file-card found" : "file-card"
            }
          >
            <div className="file-number">
              EXHIBIT 0{i + 1}
              <span>{game.clues.includes(c.id) ? c.icon : "?"}</span>
            </div>
            <h3>
              {game.clues.includes(c.id) ? c.title : "Undiscovered evidence"}
            </h3>
            <p>
              {game.clues.includes(c.id)
                ? c.description
                : "Explore the room. Look for a floating gold marker."}
            </p>
          </article>
        ))}
      </div>
      <div className="notebook-footer">
        <button className="text-button" onClick={onReset}>
          Reset case
        </button>
        <button className="primary" onClick={onAccuse}>
          Make your case <span>↗</span>
        </button>
      </div>
    </section>
  );
}

export function Accusation({
  game,
  onSolve,
  onClose,
}: {
  game: SaveGame;
  onSolve: () => void;
  onClose: () => void;
}) {
  const [suspect, setSuspect] = useState<SuspectId>("alex");
  const [motive, setMotive] = useState("robbery");
  const [evidence, setEvidence] = useState<ClueId[]>([]);
  const [feedback, setFeedback] = useState("");
  return (
    <section
      className="panel accusation"
      role="dialog"
      aria-modal="true"
      aria-label="Submit your conclusion"
    >
      <div className="panel-top">
        <span className="eyebrow">YOUR FINAL THEORY</span>
        <button onClick={onClose} aria-label="Close theory">
          ✕
        </button>
      </div>
      <h2>Who planned the robbery?</h2>
      <p className="muted">
        A good detective can explain who, why, and the evidence that connects
        them.
      </p>
      <label>
        Who arranged the cash pickup?
        <select
          value={suspect}
          onChange={(e) => setSuspect(e.target.value as SuspectId)}
        >
          {suspects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {s.role.toLowerCase()}
            </option>
          ))}
        </select>
      </label>
      <label>
        Why?
        <select value={motive} onChange={(e) => setMotive(e.target.value)}>
          <option value="robbery">
            To steal the bank’s cash through a courier
          </option>
          <option value="liquor">To steal the manager’s liquor</option>
          <option value="sleep">To hide sleeping on duty</option>
        </select>
      </label>
      <fieldset>
        <legend>Attach supporting evidence</legend>
        {game.clues.length === 0 && (
          <p className="muted">Find evidence in the room first.</p>
        )}
        {clues
          .filter((c) => game.clues.includes(c.id))
          .map((c) => (
            <label className="checkbox-label" key={c.id}>
              <input
                type="checkbox"
                checked={evidence.includes(c.id)}
                onChange={(e) =>
                  setEvidence((prev) =>
                    e.target.checked
                      ? [...prev, c.id]
                      : prev.filter((id) => id !== c.id),
                  )
                }
              />
              {c.title}
            </label>
          ))}
      </fieldset>
      {feedback && (
        <p role="status" className="hint-box">
          {feedback}
        </p>
      )}
      <button
        className="primary"
        onClick={() =>
          evaluateAccusation(suspect, motive, evidence)
            ? onSolve()
            : setFeedback(
                "That theory isn’t supported yet. You need evidence of both staff-corridor access and the courier booking. Keep investigating; you can try again.",
              )
        }
      >
        Submit conclusion <span>↗</span>
      </button>
    </section>
  );
}

export function Ending({ onClose }: { onClose: () => void }) {
  return (
    <section
      className="panel ending"
      role="dialog"
      aria-modal="true"
      aria-label="Case solved"
    >
      <div className="eyebrow">
        <span className="status-dot" /> CASE CLOSED
      </div>
      <h2>
        Everyone hid something.
        <br />
        <span>Sam planned the robbery.</span>
      </h2>
      <p>
        Alex stole the manager’s liquor. Jordan slept through his shift. Sam
        used the unlocked security terminal to send a courier for the bank’s
        cash.
      </p>
      <div className="hint-box">
        The staff-corridor record places Sam inside. The pickup instructions
        connect his contractor ID to the runner. Two records. One mastermind.
      </div>
      <button className="primary" onClick={onClose}>
        Return to the room ↗
      </button>
    </section>
  );
}
