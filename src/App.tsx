import { resetInterviews } from "./game/chat";
import { computeDemoStep } from "./game/demo";
import { useCallback, useEffect, useRef, useState } from "react";
import World from "./world/World";
import { clues, suspects } from "./game/case";
import { freshGame, loadGame, persistGame } from "./game/save";
import type { Message, SuspectId, TargetId } from "./game/types";
import { submitCase, type CaseVerdict } from "./game/submission";
import CaseSubmission, { CaseRetry, VerdictOverlay } from "./ui/CaseSubmission";
import DemoGuide from "./ui/DemoGuide";
import InvestigationBoard, {
  loadBoardLinks,
  persistBoardLinks,
} from "./ui/InvestigationBoard";
import OpeningOverlay from "./ui/OpeningOverlay";
import { createOpeningAudio, type OpeningAudio } from "./world/openingAudio";
import type { OpeningShot } from "./world/openingTimeline";
import {
  CaseBrief,
  CluePanel,
  DialogueHud,
  Ending,
  Notebook,
} from "./ui/Panels";

type Panel =
  | TargetId
  | "notebook"
  | "board"
  | "accusation"
  | "ending"
  | "case-result"
  | null;
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
  const [verdict, setVerdict] = useState<CaseVerdict | null>(null);
  const [failedSuspect, setFailedSuspect] = useState<SuspectId | null>(null);
  const [talkingTo, setTalkingTo] = useState<SuspectId | null>(null);
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [streamReply, setStreamReply] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
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
    setTalkingTo(null);
    setThinking(false);
    setSpeaking(false);
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
  const startDemo = useCallback(() => {
    resetInterviews();
    setGame(freshGame());
    updateBoardLinks([]);
    setDemoMode(true);
    setVerdict(null);
    setFailedSuspect(null);
    setIntroSeen(false);
    setEnterAtBank(false);
    setKeyboardMode(false);
    try {
      localStorage.removeItem(INTRO_SEEN_KEY);
    } catch {
      /* Demo still runs in this tab. */
    }
    startOpening();
  }, [startOpening]);
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
  const confirmCase = (suspectId: SuspectId) => {
    const result = submitCase(game, suspectId);
    if (result.decision.status === "insufficient-evidence")
      return result.decision;
    document.exitPointerLock?.();
    setKeyboardMode(true);
    setTalkingTo(null);
    setThinking(false);
    setSpeaking(false);
    setTarget(null);
    setPanel(null);
    setFailedSuspect(
      result.decision.status === "wrong-suspect" ? suspectId : null,
    );
    if (result.decision.status === "solved")
      setGame((prev) => ({ ...prev, solved: true }));
    setVerdict(result.decision);
    return result.decision;
  };
  const completeVerdict = useCallback(() => {
    if (!verdict) return;
    setPanel(verdict.status === "solved" ? "ending" : "case-result");
    setVerdict(null);
  }, [verdict]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLSelectElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (!started || panel || verdict || e.repeat) return;
      if (cinematic) {
        if (e.code === "Escape") {
          e.preventDefault();
          setSkipIntro(true);
        }
        return;
      }
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
  }, [
    started,
    panel,
    verdict,
    talkingTo,
    cinematic,
    locked,
    keyboardMode,
    target,
    open,
    resume,
  ]);
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
    if (thinking || streaming) return;
    const timer = window.setTimeout(() => setSpeaking(false), 4200);
    return () => window.clearTimeout(timer);
  }, [talkingTo, thinking, streaming, lastReply]);
  const bubbleText = talkingSuspect
    ? (streamReply ?? lastReply ?? talkingSuspect.opening)
    : null;
  const demoStep = computeDemoStep({
    demoMode,
    cinematic,
    started,
    game,
  });
  const clue = clues.find((c) => c.id === panel);
  const targetName =
    target === "submission"
      ? game.solved
        ? "Final case report"
        : "Submit case"
      : (suspects.find((s) => s.id === target)?.name ??
        clues.find((c) => c.id === target)?.title);
  return (
    <main className="game-shell">
      <div
        className={`world ${!started ? "world-intro" : ""}`}
        onClick={() => {
          if (started && !cinematic && !verdict && !panel && keyboardMode)
            captureMouse();
        }}
      >
        <World
          active={started && !panel && !talkingTo && !cinematic && !verdict}
          keyboardMode={keyboardMode}
          collected={game.clues}
          target={target}
          talkingTo={talkingTo}
          speaking={speaking}
          bubbleText={bubbleText}
          thinking={thinking}
          streaming={streaming}
          onTarget={setTarget}
          onLock={onLock}
          cinematic={cinematic}
          skipIntro={skipIntro}
          introAudio={introAudio}
          onIntroShot={setIntroShot}
          onIntroComplete={completeIntro}
          enterAtBank={enterAtBank}
          solved={game.solved}
          verdict={verdict}
          onVerdictComplete={completeVerdict}
        />
      </div>
      <div className="vignette" />
      {!cinematic && !verdict && (
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
            onStartDemo={startDemo}
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
      {verdict && <VerdictOverlay verdict={verdict} />}
      {demoMode && demoStep && !verdict && (
        <DemoGuide step={demoStep} onExit={() => setDemoMode(false)} />
      )}
      {started && !cinematic && !verdict && (
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
          {!panel && !talkingTo && (locked || keyboardMode) && (
            <>
              <div className={`crosshair ${target ? "has-target" : ""}`} />
              <div className="interaction-prompt">
                {target ? (
                  <>
                    <kbd>E</kbd>
                    <span>
                      {target === "submission"
                        ? "Use"
                        : suspects.some((s) => s.id === target)
                          ? "Talk to"
                          : "Inspect"}{" "}
                      <strong>{targetName}</strong>
                    </span>
                  </>
                ) : (
                  <span className="explore-hint">
                    {game.clues.includes("badge") && game.clues.includes("heat")
                      ? "Ready to make your case? Use the terminal by the bank exit."
                      : "Enter the bank. Follow the gold markers."}
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
          {!panel && !talkingTo && !demoMode && (
            <button className="board-launcher" onClick={() => open("board")}>
              <kbd>B</kbd> Investigation board <span aria-hidden="true">⌁</span>
            </button>
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
          )}
          {talkingSuspect && (
            <DialogueHud
              key={talkingSuspect.id}
              suspect={talkingSuspect}
              game={game}
              demoMode={demoMode}
              onMessages={saveMessages}
              onClose={resume}
              onThinking={setThinking}
              onStreamText={setStreamReply}
              onStreaming={setStreaming}
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
                  setVerdict(null);
                  setFailedSuspect(null);
                  setDemoMode(false);
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
          {(panel === "accusation" || panel === "submission") &&
            (game.solved ? (
              <Ending onClose={resume} />
            ) : (
              <CaseSubmission
                game={game}
                onClose={resume}
                onConfirm={confirmCase}
              />
            ))}
          {panel === "case-result" && failedSuspect && (
            <CaseRetry
              suspectId={failedSuspect}
              onRetry={() => setPanel("submission")}
              onClose={resume}
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
