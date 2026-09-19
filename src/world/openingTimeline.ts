import type { Position } from "../game/types";

export const OPENING_DURATION = 10;
export const OPENING_HANDOFF: Position = [0, 1.7, 20.5];
export const OPENING_LOOK_AT: Position = [0, 1.7, 9];
export type OpeningShot = "cafe" | "blast" | "escape" | "handoff";

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
function mix(a: Position, b: Position, t: number): Position {
  return a.map((value, i) => value + (b[i] - value) * t) as Position;
}

// A pure ten-second timeline: camera, actors and effects agree even if frames
// are dropped. Both natural completion and Skip sample the same final pose.
export function openingFrame(seconds: number) {
  const t = Math.max(0, Math.min(OPENING_DURATION, seconds));
  const shot: OpeningShot =
    t < 3 ? "cafe" : t < 5 ? "blast" : t < 8 ? "escape" : "handoff";
  let camera: Position;
  let lookAt: Position;
  let fov: number;
  if (t < 3) {
    const p = ease(t / 3);
    camera = mix([6.6, 2.65, 33.6], [5.9, 2.3, 31.6], p);
    lookAt = [0, 1.8, 9];
    fov = 55 - p * 3;
  } else if (t < 5) {
    const p = ease((t - 3) / 2);
    camera = mix([3.6, 2.15, 28.9], [3.35, 2.1, 28.25], p);
    lookAt = [0, 2.05, 8.2];
    fov = 46;
  } else if (t < 8) {
    const p = ease((t - 5) / 3);
    camera = mix([1.5, 2.3, 25.9], [1.35, 2.05, 23.8], p);
    lookAt = mix([0, 1.65, 9], [-1.6, 1.65, 10.8], p);
    fov = 51;
  } else {
    const p = ease((t - 8) / 2);
    camera = mix([1.35, 2.05, 23.8], OPENING_HANDOFF, p);
    lookAt = mix([-1.6, 1.65, 10.8], OPENING_LOOK_AT, p);
    fov = 51 + p * 14;
  }
  const runner =
    t < 5.8
      ? mix([0, 0, 7.3], [0, 0, 12.8], clamp((t - 5) / 0.8))
      : mix([0, 0, 12.8], [-17, 0, 15.8], clamp((t - 5.8) / 2.4));
  return {
    time: t,
    shot,
    camera,
    lookAt,
    fov,
    player: mix([0.4, 0, 23.4], [0, 0, 20.5], ease((t - 5) / 2.8)),
    runner,
    runnerYaw: t < 5.8 ? 0 : -Math.atan2(17, 3),
    flash: t >= 3 && t < 3.65 ? Math.exp(-(t - 3) * 10) : 0,
    smoke: clamp((t - 3) / 0.45) * (1 - clamp((t - 4.8) / 2.8)),
    emergency: t >= 3 && t < 9.3 ? 0.55 + Math.sin((t - 3) * 7) * 0.45 : 0,
  };
}

export const openingCaptions: Record<
  OpeningShot,
  { label: string; text: string }
> = {
  cafe: {
    label: "CAPITAL ONE CAFÉ · 11:47 PM",
    text: "One quiet moment before everything changed.",
  },
  blast: {
    label: "ACROSS THE STREET",
    text: "[A muffled blast. The bank lights turn red.]",
  },
  escape: {
    label: "SOMEONE IS LEAVING",
    text: "A figure. A bag. Then they’re gone.",
  },
  handoff: { label: "YOUR INVESTIGATION BEGINS", text: "Investigate the bank" },
};
