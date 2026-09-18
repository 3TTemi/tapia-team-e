import { resetInterviews } from "./game/chat";
import { useCallback, useEffect, useRef, useState } from "react";
import World from "./world/World";
import { clues, suspects } from "./game/case";
import { freshGame, loadGame, persistGame } from "./game/save";
import type { Message, SuspectId, TargetId } from "./game/types";
import InvestigationBoard, {
  loadBoardLinks,
  persistBoardLinks,
} from "./ui/InvestigationBoard";
import OpeningOverlay from "./ui/OpeningOverlay";
import { createOpeningAudio, type OpeningAudio } from "./world/openingAudio";
import type { OpeningShot } from "./world/openingTimeline";
import {
  Accusation,
  CaseBrief,
  CluePanel,
  DialoguePanel,
  Ending,
  Notebook,
} from "./ui/Panels";

type Panel = TargetId | "notebook" | "board" | "accusation" | "ending" | null;
const INTRO_SEEN_KEY = "last-commit-opening-seen-v1";

function hasSeenOpening() {
  try {
    return localStorage.getItem(INTRO_SEEN_KEY) === "yes";
  } catch {
    return false;
  }
}

export default function App() {
  const [game, setGame] = useState(loadGame);
  const [boardLinks, setBoardLinks] = useState(loadBoardLinks);
  const updateBoardLinks = (links: typeof boardLinks) => {
    setBoardLinks(links);
    if (!persistBoardLinks(links))
      setError(
        "Browser storage is unavailable. Board connections will last only for this tab.",
      );
  };
  const [started, setStarted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState(false);
  const [target, setTarget] = useState<TargetId | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [error, setError] = useState("");
  const [introSeen, setIntroSeen] = useState(hasSeenOpening);
  const [cinematic, setCinematic] = useState(false);
  const [skipIntro, setSkipIntro] = useState(false);
  const [introShot, setIntroShot] = useState<OpeningShot>("cafe");
  const [enterAtBank, setEnterAtBank] = useState(false);
  const introAudio = useRef<OpeningAudio>(null);
  const hasProgress =
    game.clues.length > 0 ||
    game.solved ||
    Object.values(game.histories).some((history) => history.length > 0);
  const canContinue = introSeen || hasProgress;
  useEffect(
    () => () => {
      introAudio.current?.dispose();
    },
    [],
  );
  useEffect(() => {
    if (!persistGame(game))
      setError(
        "Browser storage is unavailable. Progress will last only for this tab.",
      );
  }, [game]);
  const captureMouse = useCallback(() => {
    setError("");
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
          "Your browser needs a direct click for mouse control. Use the mouse control button, or continue with keyboard controls.",
        ),
      );
    } catch {
      setError(
        "Mouse capture failed. Click Resume and allow mouse control in your browser.",
      );
    }
  }, []);
  const onLock = useCallback((value: boolean) => {
    setLocked(value);
    if (value) {
      setKeyboardMode(false);
      setError("");
    }
  }, []);
  const resume = useCallback(() => {
    setStarted(true);
    setPanel(null);
    if (!keyboardMode) captureMouse();
  }, [keyboardMode, captureMouse]);
  const completeIntro = useCallback(() => {
    introAudio.current?.dispose();
    introAudio.current = null;
    setCinematic(false);
    setIntroSeen(true);
    setEnterAtBank(true);
    setKeyboardMode(true);
    setTarget(null);
    try {
      localStorage.setItem(INTRO_SEEN_KEY, "yes");
    } catch {
      /* In-memory state still prevents replay. */
    }
  }, []);
  const startOpening = useCallback(() => {
    setError("");
    setStarted(true);
    setPanel(null);
    setEnterAtBank(false);
    document.exitPointerLock?.();
    introAudio.current?.dispose();
    introAudio.current = createOpeningAudio();
    setSkipIntro(false);
    setIntroShot("cafe");
    setCinematic(true);
  }, []);
  const startGame = useCallback(() => {
    if (canContinue) {
      setError("");
      setStarted(true);
      setPanel(null);
      setEnterAtBank(true);
      setKeyboardMode(true);
      captureMouse();
      return;
    }
    startOpening();
  }, [canContinue, captureMouse, startOpening]);
  const open = useCallback((next: Panel) => {
    document.exitPointerLock?.();
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
      if (cinematic) {
        if (e.code === "Escape") {
          e.preventDefault();
          setSkipIntro(true);
        }
        return;
      }
      if (e.code === "KeyE" && (locked || keyboardMode) && target) {
        e.preventDefault();
        open(target);
      }
      if (e.code === "KeyB") {
        e.preventDefault();
        open("board");
      }
      if (e.code === "KeyN") {
        e.preventDefault();
        open("notebook");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, panel, cinematic, locked, keyboardMode, target, open]);
  const saveMessages = (id: SuspectId, messages: Message[]) =>
    setGame((prev) => ({
      ...prev,
      histories: { ...prev.histories, [id]: messages },
    }));
  const suspect = suspects.find((s) => s.id === panel);
  const clue = clues.find((c) => c.id === panel);
  const targetName =
    suspects.find((s) => s.id === target)?.name ??
    clues.find((c) => c.id === target)?.title;
  return (
    <main className="game-shell">
      <div
        className={`world ${!started ? "world-intro" : ""}`}
        onClick={() => {
          if (started && !cinematic && !panel && keyboardMode) captureMouse();
        }}
      >
        <World
          active={started && !panel && !cinematic}
          keyboardMode={keyboardMode}
          collected={game.clues}
          target={target}
          onTarget={setTarget}
          onLock={onLock}
          cinematic={cinematic}
          skipIntro={skipIntro}
          introAudio={introAudio}
          onIntroShot={setIntroShot}
          onIntroComplete={completeIntro}
          enterAtBank={enterAtBank}
        />
      </div>
      <div className="vignette" />
      {!cinematic && (
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
      )}
      {!started && (
        <>
          <div className="intro-shade" />
          <CaseBrief
            resume={startGame}
            hasSave={canContinue}
            onWatchOpening={startOpening}
          />
          <div className="scene-caption">
            <span className="eyebrow">THE SCENE</span>
            <p>
              BANK DISTRICT
              <br />
              <span>11:47 PM · Somewhere between ambition and caffeine.</span>
            </p>
          </div>
        </>
      )}
      {cinematic && (
        <OpeningOverlay shot={introShot} onSkip={() => setSkipIntro(true)} />
      )}
      {started && !cinematic && (
        <>
          <aside className="objective">
            <div className="eyebrow">
              {game.solved ? "CASE CLOSED" : "CURRENT OBJECTIVE"}
            </div>
            <h3>
              {game.solved
                ? "The robbery is solved."
                : game.clues.length === 0
                  ? "Investigate the bank."
                  : "Find out who arranged the robbery."}
            </h3>
            <p>
              {game.clues.length} / {clues.length} clues collected{" "}
              <span>·</span>{" "}
              {Object.values(game.histories).filter((h) => h.length > 0).length}{" "}
              / 3 suspects interviewed
            </p>
          </aside>
          {!panel && (locked || keyboardMode) && (
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
                    Enter the bank. Follow the gold markers.
                  </span>
                )}
              </div>
            </>
          )}
          {!panel && !locked && !keyboardMode && (
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
          {!panel && (
            <button className="board-launcher" onClick={() => open("board")}>
              <kbd>B</kbd> Investigation board <span aria-hidden="true">⌁</span>
            </button>
          )}
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
            {keyboardMode && (
              <button className="mouse-look-button" onClick={captureMouse}>
                Enable mouse look ↗
              </button>
            )}
            <button
              className="notebook-button"
              onClick={() => open("notebook")}
            >
              <kbd>N</kbd> Case notebook <span>{game.clues.length}/5</span>
            </button>
          </footer>
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
          {suspect && (
            <DialoguePanel
              key={suspect.id}
              suspect={suspect}
              game={game}
              onMessages={saveMessages}
              onClose={resume}
            />
          )}
          {clue && <CluePanel clue={clue} onClose={resume} />}
          {panel === "board" && (
            <InvestigationBoard
              game={game}
              links={boardLinks}
              onLinks={updateBoardLinks}
              onClose={resume}
            />
          )}
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
                  resetInterviews();
                  setGame(freshGame());
                  updateBoardLinks([]);
                  setIntroSeen(false);
                  setEnterAtBank(false);
                  setKeyboardMode(false);
                  setCinematic(false);
                  try {
                    localStorage.removeItem(INTRO_SEEN_KEY);
                  } catch {
                    /* Reset still works in this tab. */
                  }
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
