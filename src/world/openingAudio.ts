// All sound is synthesized locally, and created from the Start gesture. The
// timeline still works when audio is unavailable, suspended or muted.
export function createOpeningAudio() {
  try {
    const context = new AudioContext();
    void context.resume().catch(() => {});
    const master = context.createGain();
    master.gain.value = 0.22;
    master.connect(context.destination);
    const played = { start: false, blast: false, escape: false, handoff: false };

    const tone = (
      frequency: number,
      duration: number,
      volume: number,
      type: OscillatorType = "sine",
      offset = 0,
    ) => {
      const now = context.currentTime + offset;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain).connect(master);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.05);
    };

    const noise = (duration: number, volume: number) => {
      const buffer = context.createBuffer(
        1,
        context.sampleRate * duration,
        context.sampleRate,
      );
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++)
        data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      const source = context.createBufferSource();
      const gain = context.createGain();
      gain.gain.value = volume;
      source.buffer = buffer;
      source.connect(gain).connect(master);
      source.start();
      source.stop(context.currentTime + duration);
    };

    return {
      start() {
        if (played.start || context.state !== "running") return;
        played.start = true;
        tone(54, 4.5, 0.045, "sine");
        tone(82, 3.8, 0.018, "triangle", 0.12);
      },
      blast() {
        if (played.blast || context.state !== "running") return;
        played.blast = true;
        noise(0.55, 0.16);
        tone(85, 0.95, 0.24);
        tone(142, 0.18, 0.06, "square");
      },
      escape() {
        if (played.escape || context.state !== "running") return;
        played.escape = true;
        tone(220, 0.18, 0.045, "triangle");
        tone(165, 0.28, 0.035, "triangle", 0.11);
      },
      handoff() {
        if (played.handoff || context.state !== "running") return;
        played.handoff = true;
        tone(196, 0.65, 0.045, "sine");
        tone(294, 0.8, 0.035, "sine", 0.08);
        tone(392, 1, 0.025, "sine", 0.16);
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
