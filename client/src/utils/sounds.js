// ─── Sound Effects (Web Audio API — no external files needed) ─────────────────
// Generates short procedural sounds using oscillators.
// No dependencies, no asset files required.

let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function beep({ frequency = 440, type = 'sine', duration = 0.12, gain = 0.25, delay = 0 } = {}) {
  try {
    const ac  = getCtx();
    const osc = ac.createOscillator();
    const vol = ac.createGain();

    osc.type      = type;
    osc.frequency.setValueAtTime(frequency, ac.currentTime + delay);
    vol.gain.setValueAtTime(gain, ac.currentTime + delay);
    vol.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + duration);

    osc.connect(vol);
    vol.connect(ac.destination);
    osc.start(ac.currentTime + delay);
    osc.stop(ac.currentTime + delay + duration);
  } catch (_) {
    // silently fail if audio is blocked
  }
}

export const Sounds = {
  playCard() {
    beep({ frequency: 600, type: 'triangle', duration: 0.09, gain: 0.2 });
  },
  drawCard() {
    beep({ frequency: 300, type: 'sine', duration: 0.08, gain: 0.15 });
  },
  wildCard() {
    beep({ frequency: 520, type: 'sawtooth', duration: 0.08, gain: 0.18 });
    beep({ frequency: 780, type: 'sawtooth', duration: 0.08, gain: 0.18, delay: 0.1 });
  },
  unoCall() {
    beep({ frequency: 880, type: 'square', duration: 0.12, gain: 0.3 });
    beep({ frequency: 1100, type: 'square', duration: 0.15, gain: 0.3, delay: 0.13 });
  },
  win() {
    [523, 659, 784, 1047].forEach((f, i) =>
      beep({ frequency: f, type: 'triangle', duration: 0.2, gain: 0.25, delay: i * 0.12 })
    );
  },
  lose() {
    [400, 330, 260].forEach((f, i) =>
      beep({ frequency: f, type: 'sine', duration: 0.22, gain: 0.2, delay: i * 0.15 })
    );
  },
  tick() {
    beep({ frequency: 1000, type: 'sine', duration: 0.04, gain: 0.1 });
  },
};
