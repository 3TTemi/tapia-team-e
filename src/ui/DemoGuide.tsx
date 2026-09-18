import type { DemoStep } from "../game/demo";
import { demoStepIndex } from "../game/demo";

export default function DemoGuide({
  step,
  onExit,
}: {
  step: DemoStep;
  onExit: () => void;
}) {
  const index = demoStepIndex(step);
  return (
    <aside className="demo-guide" aria-live="polite">
      <div className="demo-guide-top">
        <span className="demo-guide-kicker">
          <span className="status-dot" /> 90S DEMO · STEP {index}/7
        </span>
        <button
          className="demo-guide-exit"
          onClick={onExit}
          aria-label="Exit demo mode"
        >
          Exit
        </button>
      </div>
      <strong>{step.label}</strong>
      <p>{step.hint}</p>
    </aside>
  );
}
