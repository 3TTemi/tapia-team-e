import { useState } from "react";
import "./terminal-wire-puzzle.css";

const wires = [
  {
    id: "A",
    color: "#edba61",
    path: "M 42 45 H 154 Q 174 45 174 65 V 105 Q 174 125 194 125 H 408",
    endpoint: "RECORDS",
  },
  {
    id: "B",
    color: "#6bdae0",
    path: "M 42 125 H 106 Q 126 125 126 145 V 185 Q 126 205 146 205 H 408",
    endpoint: "ALARM",
  },
  {
    id: "C",
    color: "#df9ada",
    path: "M 42 205 H 248 Q 268 205 268 185 V 65 Q 268 45 288 45 H 408",
    endpoint: "POWER",
  },
] as const;

export default function TerminalWirePuzzle({
  onUnlock,
}: {
  onUnlock: () => void;
}) {
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState("");
  function cut(id: string) {
    if (solved) return;
    const wire = wires.find((entry) => entry.id === id)!;
    if (wire.endpoint === "ALARM") {
      setSolved(true);
      setFeedback(
        "Alarm loop isolated. Power and records intact. Terminal unlocked.",
      );
    } else {
      setFeedback(
        `${wire.endpoint === "POWER" ? "Power" : "Records"} circuit protected. Cut cancelled—trace the wire ending at ALARM and try again.`,
      );
    }
  }
  return (
    <div className={`wire-puzzle ${solved ? "wire-puzzle-solved" : ""}`}>
      <p className="eyebrow">SECURITY LOCK · MANUAL OVERRIDE</p>
      <h2>{solved ? "Connection restored." : "Cut the alarm loop."}</h2>
      <p>
        Trace the wires. Disconnect <strong>ALARM</strong> while keeping{" "}
        <strong>POWER</strong> and <strong>RECORDS</strong> connected.
      </p>
      <div className="wire-diagram">
        <svg
          viewBox="0 0 560 250"
          role="img"
          aria-labelledby="wire-title wire-description"
        >
          <title id="wire-title">Terminal wiring diagram</title>
          <desc id="wire-description">
            Trace each lettered wire to its destination: A connects to Records,
            B connects to Alarm, and C connects to Power. Cut controls are below
            the diagram.
          </desc>
          {[45, 125, 205].map((y) => (
            <path
              key={y}
              d={`M 18 ${y} H 535`}
              stroke="#243e47"
              strokeDasharray="2 8"
            />
          ))}
          {wires.map((wire) => (
            <g key={wire.id}>
              <path
                d={wire.path}
                fill="none"
                stroke="#07131b"
                strokeWidth="17"
                strokeLinejoin="round"
              />
              <path
                d={wire.path}
                fill="none"
                stroke={wire.color}
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          ))}
          {wires.map((wire, i) => (
            <g key={wire.id}>
              <circle
                cx="38"
                cy={45 + i * 80}
                r="19"
                fill="#112a34"
                stroke={wire.color}
                strokeWidth="2"
              />
              <text
                x="38"
                y={51 + i * 80}
                textAnchor="middle"
                fill="#f5f4e7"
                fontSize="19"
                fontFamily="monospace"
              >
                {wire.id}
              </text>
            </g>
          ))}
          {["POWER", "RECORDS", "ALARM"].map((label, i) => (
            <g key={label}>
              <rect
                x="403"
                y={27 + i * 80}
                width="138"
                height="36"
                rx="6"
                fill="#182d36"
                stroke="#59747c"
              />
              <text
                x="472"
                y={51 + i * 80}
                textAnchor="middle"
                fill="#f5f4e7"
                fontSize="16"
                fontFamily="monospace"
              >
                {label}
              </text>
            </g>
          ))}
          {solved && (
            <g className="wire-cut-sparks">
              <path d="M 65 125 H 88" stroke="#0b1c26" strokeWidth="16" />
              <path
                className="wire-spark"
                d="M 76 119 L 64 100 M 81 121 L 99 108 M 76 131 L 69 151 M 83 130 L 101 144"
                stroke="#ffe5a0"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <text
                x="76"
                y="132"
                textAnchor="middle"
                fill="#f5efce"
                fontSize="23"
              >
                ✂
              </text>
            </g>
          )}
        </svg>
      </div>
      <div className="wire-actions" role="group" aria-label="Wire cutters">
        {wires.map((wire) => (
          <button
            key={wire.id}
            disabled={solved}
            onClick={() => cut(wire.id)}
            style={{ borderColor: wire.color }}
            aria-label={`Cut wire ${wire.id}`}
          >
            <span aria-hidden="true">✂</span> Cut {wire.id}
          </button>
        ))}
      </div>
      <p className="wire-feedback" role="status">
        {feedback ||
          "Choose a wire to cut. The terminal protects the other circuits."}
      </p>
      {solved && (
        <button className="primary" onClick={onUnlock}>
          Open suspect selection <span aria-hidden="true">↗</span>
        </button>
      )}
    </div>
  );
}
