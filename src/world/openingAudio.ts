// All sound is synthesized locally, and created from the Start gesture. The
// timeline still works when audio is unavailable, suspended or muted.
export function createOpeningAudio() {
  try {
    const context = new AudioContext();
    void context.resume().catch(() => {});
    let played = false;
    return {
      blast() {
        if (played || context.state !== "running") return;
        played = true;
        const now = context.currentTime;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(85, now);
        oscillator.frequency.exponentialRampToValueAtTime(28, now + 0.65);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.24, now + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(now);
        oscillator.stop(now + 1);
      },
      dispose() {
        if (context.state !== "closed") void context.close().catch(() => {});
      },
    };
  } catch {
    return null;
  }
}

export type OpeningAudio = ReturnType<typeof createOpeningAudio>;
