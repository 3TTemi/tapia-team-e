import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { clues, characters } from "../game/case";
import type { SaveGame, TargetId } from "../game/types";
import "./investigation-board.css";

export type BoardLink = [TargetId, TargetId];
const STORAGE_KEY = "last-commit-board-v1";
export function loadBoardLinks(): BoardLink[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    const ids = new Set<string>(
      [...characters, ...clues].map((item) => item.id),
    );
    const seen = new Set<string>();
    if (!Array.isArray(raw)) return [];
    return raw.filter((link): link is BoardLink => {
      if (
        !Array.isArray(link) ||
        link.length !== 2 ||
        !link.every((id) => typeof id === "string" && ids.has(id)) ||
        link[0] === link[1]
      )
        return false;
      const key = [...link].sort().join(":");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch {
    return [];
  }
}
export function persistBoardLinks(links: BoardLink[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    return true;
  } catch {
    return false;
  }
}
type Point = { x: number; y: number };

export default function InvestigationBoard({
  game,
  links,
  onLinks,
  onClose,
}: {
  game: SaveGame;
  links: BoardLink[];
  onLinks: (links: BoardLink[]) => void;
  onClose: () => void;
}) {
  const surface = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    id: TargetId;
    x: number;
    y: number;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);
  const [selected, setSelected] = useState<TargetId | null>(null);
  const [pointer, setPointer] = useState<Point | null>(null);
  const [anchors, setAnchors] = useState<Partial<Record<TargetId, Point>>>({});
  const [notice, setNotice] = useState(
    "Your connections are theories, not confirmed facts.",
  );
  const evidence = clues.filter((clue) => game.clues.includes(clue.id));
  const visibleIds = new Set<TargetId>(
    [...characters, ...evidence].map((item) => item.id),
  );
  const visibleLinks = links.filter(
    ([a, b]) => visibleIds.has(a) && visibleIds.has(b),
  );
  const name = (id: TargetId) =>
    characters.find((s) => s.id === id)?.name ??
    clues.find((c) => c.id === id)?.title ??
    id;
  useLayoutEffect(() => {
    const element = surface.current;
    if (!element) return;
    const measure = () => {
      const box = element.getBoundingClientRect();
      const next: Partial<Record<TargetId, Point>> = {};
      element
        .querySelectorAll<HTMLElement>("[data-board-pin]")
        .forEach((pin) => {
          const rect = pin.getBoundingClientRect();
          next[pin.dataset.boardPin as TargetId] = {
            x: rect.left + rect.width / 2 - box.left,
            y: rect.top + rect.height / 2 - box.top,
          };
        });
      setAnchors(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    element
      .querySelectorAll("article")
      .forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [game.clues.join(",")]);
  function connect(a: TargetId, b: TargetId) {
    setSelected(null);
    if (a === b) return;
    if (
      visibleLinks.some(
        ([x, y]) => (x === a && y === b) || (x === b && y === a),
      )
    ) {
      setNotice("Those cards are already connected.");
      return;
    }
    onLinks([...visibleLinks, [a, b]]);
    setNotice(`Connected ${name(a)} and ${name(b)}.`);
  }
  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (!drag.current || !surface.current) return;
      if (
        Math.hypot(
          event.clientX - drag.current.x,
          event.clientY - drag.current.y,
        ) > 5
      )
        drag.current.moved = true;
      if (!drag.current.moved) return;
      const box = surface.current.getBoundingClientRect();
      setSelected(drag.current.id);
      setPointer({ x: event.clientX - box.left, y: event.clientY - box.top });
    };
    const finish = (event: PointerEvent) => {
      const active = drag.current;
      drag.current = null;
      setPointer(null);
      if (!active?.moved) return;
      suppressClick.current = true;
      const target = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest<HTMLElement>("[data-board-pin]")?.dataset.boardPin as
        TargetId | undefined;
      if (target && visibleIds.has(target)) connect(active.id, target);
      else {
        setSelected(null);
        setNotice("Drop on another card’s pin to connect it.");
      }
    };
    const cancel = () => {
      drag.current = null;
      setPointer(null);
      setSelected(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", cancel);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", cancel);
    };
  });
  const pin = (id: TargetId) => (
    <button
      className={`ib-pin ${selected === id ? "ib-pin-selected" : ""}`}
      data-board-pin={id}
      aria-label={`Connect ${name(id)}`}
      aria-pressed={selected === id}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        suppressClick.current = false;
        drag.current = { id, x: event.clientX, y: event.clientY, moved: false };
      }}
      onClick={() => {
        if (suppressClick.current) {
          suppressClick.current = false;
          return;
        }
        if (selected) connect(selected, id);
        else setSelected(id);
      }}
    >
      <span />
    </button>
  );
  const stringPath = (a: Point, b: Point) =>
    `M ${a.x} ${a.y} Q ${(a.x + b.x) / 2} ${(a.y + b.y) / 2 + Math.min(65, Math.abs(a.x - b.x) * 0.13 + 20)} ${b.x} ${b.y}`;
  return (
    <section
      className="investigation-board"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ib-title"
    >
      <header className="ib-header">
        <div>
          <p className="ib-kicker">CASE 001 / WORKING THEORIES</p>
          <h2 id="ib-title">Connect the dots.</h2>
          <p>Drag a pin to another pin, or click two pins to tie a string.</p>
        </div>
        <button
          className="ib-close"
          onClick={onClose}
          aria-label="Close investigation board"
        >
          Close ↗
        </button>
      </header>
      <div className="ib-scroll">
        <div className="ib-surface" ref={surface}>
          <svg className="ib-strings" aria-hidden="true">
            {visibleLinks.map(([a, b]) =>
              anchors[a] && anchors[b] ? (
                <path
                  key={[a, b].sort().join(":")}
                  d={stringPath(anchors[a]!, anchors[b]!)}
                />
              ) : null,
            )}
            {selected && pointer && anchors[selected] && (
              <path
                className="ib-draft"
                d={stringPath(anchors[selected]!, pointer)}
              />
            )}
          </svg>
          <div className="ib-section-label">
            PEOPLE OF INTEREST{" "}
            <span>
              {characters.filter((s) => game.histories[s.id].length > 0).length}{" "}
              / 3 interviewed
            </span>
          </div>
          <div className="ib-witnesses">
            {characters.map((suspect) => {
              const history = game.histories[suspect.id];
              const lastReply = [...history]
                .reverse()
                .find((m) => m.role === "suspect");
              return (
                <article className="ib-card ib-person" key={suspect.id}>
                  {pin(suspect.id)}
                  <div className="ib-person-top">
                    <span
                      className="ib-avatar"
                      style={{ background: suspect.color }}
                    >
                      {suspect.name[0]}
                    </span>
                    <div>
                      <h3>{suspect.name}</h3>
                      <p className="ib-role">{suspect.role}</p>
                    </div>
                  </div>
                  <p
                    className={`ib-status ${history.length ? "ib-interviewed" : ""}`}
                  >
                    {history.length ? "● Interviewed" : "○ Not interviewed yet"}
                  </p>
                  <p className="ib-note">
                    {lastReply
                      ? lastReply.text
                      : history.length
                        ? "Interview recorded in your field notes."
                        : "Talk to this witness to record their account."}
                  </p>
                </article>
              );
            })}
          </div>
          <div className="ib-section-label ib-evidence-label">
            COLLECTED EVIDENCE{" "}
            <span>
              {evidence.length} / {clues.length} found
            </span>
          </div>
          {evidence.length ? (
            <div className="ib-evidence">
              {evidence.map((clue) => (
                <article className="ib-card ib-clue" key={clue.id}>
                  {pin(clue.id)}
                  <p className="ib-kicker">{clue.category}</p>
                  <h3>{clue.title}</h3>
                  <p className="ib-note">{clue.description}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="ib-empty">
              No evidence pinned yet.
              <span>
                Inspect the gold markers in the bank. Collected clues will
                appear here.
              </span>
            </div>
          )}
        </div>
      </div>
      <footer className="ib-footer">
        <div className="ib-feedback" role="status">
          {selected
            ? `Connecting ${name(selected)} — choose another pin.`
            : notice}
        </div>
        <div className="ib-actions">
          {selected && (
            <button
              onClick={() => {
                setSelected(null);
                setPointer(null);
              }}
            >
              Cancel connection
            </button>
          )}
          <button
            disabled={!visibleLinks.length}
            onClick={() => {
              onLinks([]);
              setSelected(null);
              setNotice(
                "All strings cleared. Your evidence and interviews are unchanged.",
              );
            }}
          >
            Clear strings
          </button>
        </div>
        {visibleLinks.length > 0 && (
          <ul className="ib-link-list" aria-label="Your connections">
            {visibleLinks.map(([a, b]) => (
              <li key={[a, b].sort().join(":")}>
                <span>
                  {name(a)} ↔ {name(b)}
                </span>
                <button
                  aria-label={`Remove connection between ${name(a)} and ${name(b)}`}
                  onClick={() => {
                    onLinks(
                      visibleLinks.filter(([x, y]) => x !== a || y !== b),
                    );
                    setNotice(
                      `Removed connection between ${name(a)} and ${name(b)}.`,
                    );
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </footer>
    </section>
  );
}
