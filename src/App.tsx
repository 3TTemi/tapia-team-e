import { useCallback, useEffect, useState } from "react";
import World from "./world/World";
import { clues, suspects } from "./game/case";
import { freshGame, loadGame, persistGame } from "./game/save";
import type { Message, SuspectId, TargetId } from "./game/types";
import {
  Accusation,
  CaseBrief,
  CluePanel,
  DialogueHud,
  Ending,
  Notebook,
} from "./ui/Panels";

type Panel = TargetId | "notebook" | "accusation" | "ending" | null;

export default function App() {
  const [game, setGame] = useState(loadGame);
  const [started, setStarted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState(false);
  const [target, setTarget] = useState<TargetId | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [talkingTo, setTalkingTo] = useState<SuspectId | null>(null);
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!persistGame(game))
      setError(
        "Browser storage is unavailable. Progress will last only for this tab.",
      );
  }, [game]);
  const resume = useCallback(() => {
    setStarted(true);
    setPanel(null);
    setTalkingTo(null);
    setThinking(false);
    setSpeaking(false);
    if (keyboardMode) return;
    const canvas = document.querySelector("canvas");
    if (!canvas?.requestPointerLock) {
      setError(
        "Mouse capture is unavailable. Open this game in a desktop browser.",
      );
      return;
    }
    try {
      const result = canvas.requestPointerLock();
      result?.catch(() =>
        setError(
          "Click Resume to capture the mouse. Your browser may require another click after Escape.",
        ),
      );
    } catch {
      setError(
        "Mouse capture failed. Click Resume and allow mouse control in your browser.",
      );
    }
  }, [keyboardMode]);
  const open = useCallback((next: Panel) => {
    document.exitPointerLock?.();
    if (suspects.some((s) => s.id === next)) {
      setTalkingTo(next as SuspectId);
      setPanel(null);
      setThinking(false);
      setSpeaking(true);
      return;
    }
    setTalkingTo(null);
    setThinking(false);
    setSpeaking(false);
    setPanel(next);
    const clue = clues.find((c) => c.id === next);
    if (clue)
      setGame((prev) =>
        prev.clues.includes(clue.id)
          ? prev
          : { ...prev, clues: [...prev.clues, clue.id] },
      );
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLSelectElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (!started || panel || e.repeat) return;
      if (talkingTo) {
        if (e.code === "Escape") {
          e.preventDefault();
          resume();
        }
        if (e.code === "KeyN") {
          e.preventDefault();
          open("notebook");
        }
        return;
      }
      if (e.code === "KeyE" && (locked || keyboardMode) && target) {
        e.preventDefault();
        open(target);
      }
      if (e.code === "KeyN") {
        e.preventDefault();
        open("notebook");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, panel, talkingTo, locked, keyboardMode, target, open, resume]);
  const saveMessages = (id: SuspectId, messages: Message[]) =>
    setGame((prev) => ({
      ...prev,
      histories: { ...prev.histories, [id]: messages },
    }));
  const talkingSuspect = suspects.find((s) => s.id === talkingTo);
  const lastReply = talkingTo
    ? [...game.histories[talkingTo]].reverse().find((m) => m.role === "suspect")
        ?.text
    : "";
  useEffect(() => {
    if (!talkingTo) {
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    if (thinking) return;
    const timer = window.setTimeout(() => setSpeaking(false), 4200);
    return () => window.clearTimeout(timer);
  }, [talkingTo, thinking, lastReply]);
  const bubbleText = talkingSuspect
    ? (lastReply ?? talkingSuspect.opening)
    : null;
  const clue = clues.find((c) => c.id === panel);
  const targetName =
    suspects.find((s) => s.id === target)?.name ??
    clues.find((c) => c.id === target)?.title;
  return (
    <main className="game-shell">
      <div className={`world ${!started ? "world-intro" : ""}`}>
        <World
          active={started && !panel && !talkingTo}
          keyboardMode={keyboardMode}
          collected={game.clues}
          target={target}
          talkingTo={talkingTo}
          speaking={speaking}
          bubbleText={bubbleText}
          thinking={thinking}
          onTarget={setTarget}
          onLock={setLocked}
        />
      </div>
      <div className="vignette" />
      <header className="top-bar">
        <a className="wordmark" href="/" aria-label="Last Commit home">
          <span className="logo-mark">LC</span> LAST COMMIT
          <span className="wordmark-divider">/</span>
          <span className="wordmark-sub">CASE 001</span>
        </a>
        <div className="top-status">
          <span className="status-dot" /> LOCAL PROTOTYPE{" "}
          <span className="version">v0.1</span>
        </div>
      </header>
      {!started && (
        <>
          <div className="intro-shade" />
          <CaseBrief resume={resume} hasSave={game.clues.length > 0} />
          <div className="scene-caption">
            <span className="eyebrow">THE SCENE</span>
            <p>
              TAPIA hackathon
              <br />
              <span>11:47 PM · Somewhere between ambition and caffeine.</span>
            </p>
          </div>
        </>
      )}
      {started && (
        <>
          <aside className="objective">
            <div className="eyebrow">
              {game.solved ? "CASE CLOSED" : "CURRENT OBJECTIVE"}
            </div>
            <h3>
              {game.solved
                ? "Sparky is accounted for."
                : "Find out who moved Sparky."}
            </h3>
            <p>
              {game.clues.length} / {clues.length} clues collected{" "}
              <span>·</span>{" "}
              {Object.values(game.histories).filter((h) => h.length > 0).length}{" "}
              / 3 suspects interviewed
            </p>
          </aside>
          {!panel && !talkingTo && (locked || keyboardMode) && (
            <>
              <div className={`crosshair ${target ? "has-target" : ""}`} />
              <div className="interaction-prompt">
                {target ? (
                  <>
                    <kbd>E</kbd>
                    <span>
                      {suspects.some((s) => s.id === target)
                        ? "Talk to"
                        : "Inspect"}{" "}
                      <strong>{targetName}</strong>
                    </span>
                  </>
                ) : (
                  <span className="explore-hint">
                    Explore the room. Follow the gold markers.
                  </span>
                )}
              </div>
            </>
          )}
          {!panel && !talkingTo && !locked && !keyboardMode && (
            <div className="pause-overlay">
              <section className="pause-card">
                <span className="eyebrow">TAKE A BREATH, DETECTIVE.</span>
                <h2>The room can wait.</h2>
                <p>Capture your mouse to explore. Press Esc to release it.</p>
                <button className="primary" onClick={resume}>
                  Resume investigation ↗
                </button>
                <button
                  className="text-button"
                  onClick={() => {
                    setKeyboardMode(true);
                    setError("");
                  }}
                >
                  Use keyboard controls instead
                </button>
                <button
                  className="text-button"
                  onClick={() => open("notebook")}
                >
                  Open notebook
                </button>
              </section>
            </div>
          )}
          {!talkingTo && (
            <footer className="game-footer">
              <div className="control-hints">
                <span>
                  <kbd>W A S D</kbd> Move
                </span>
                <span>
                  <kbd>E</kbd> Interact
                </span>
                <span>
                  {keyboardMode ? (
                    <>
                      <kbd>Q / R</kbd> Turn <kbd>T / G</kbd> Look up/down
                    </>
                  ) : (
                    <>
                      <kbd>ESC</kbd> Release mouse
                    </>
                  )}
                </span>
              </div>
              <button
                className="notebook-button"
                onClick={() => open("notebook")}
              >
                <kbd>N</kbd> Case notebook <span>{game.clues.length}/5</span>
              </button>
            </footer>
          )}
          {talkingSuspect && (
            <DialogueHud
              key={talkingSuspect.id}
              suspect={talkingSuspect}
              game={game}
              onMessages={saveMessages}
              onClose={resume}
              onThinking={setThinking}
            />
          )}
        </>
      )}
      {panel && (
        <div
          className="modal-backdrop"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              setPanel(null);
            }
            if (e.key === "Tab") {
              const focusable = [
                ...e.currentTarget.querySelectorAll<HTMLElement>(
                  "button:not(:disabled), input:not(:disabled), select",
                ),
              ];
              const first = focusable[0],
                last = focusable.at(-1);
              if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last?.focus();
              }
              if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first?.focus();
              }
            }
          }}
          ref={(element) => {
            if (element && !element.contains(document.activeElement))
              element.querySelector<HTMLButtonElement>("button")?.focus();
          }}
        >
          {clue && <CluePanel clue={clue} onClose={resume} />}
          {panel === "notebook" && (
            <Notebook
              game={game}
              onClose={resume}
              onAccuse={() => setPanel("accusation")}
              onReset={() => {
                if (
                  window.confirm(
                    "Clear your evidence and interviews and start this case again?",
                  )
                ) {
                  setGame(freshGame());
                  setPanel(null);
                  setStarted(false);
                }
              }}
            />
          )}
          {panel === "accusation" && (
            <Accusation
              game={game}
              onClose={resume}
              onSolve={() => {
                setGame((prev) => ({ ...prev, solved: true }));
                setPanel("ending");
              }}
            />
          )}
          {panel === "ending" && <Ending onClose={resume} />}
        </div>
      )}
      {error && (
        <div role="alert" className="error-toast">
          {error}
          <button
            aria-label="Dismiss notification"
            onClick={() => setError("")}
          >
            ✕
          </button>
        </div>
      )}
    </main>
  );
}
