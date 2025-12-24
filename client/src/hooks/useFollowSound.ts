import { useCallback, useRef } from "react";

// ساخت AudioContext
function createAudioContext(): AudioContext | null {
  try {
    const AudioContext =
      window.AudioContext || (window as any).webkitAudioContext;
    return new AudioContext();
  } catch {
    return null;
  }
}

export function useFollowSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playFollowSound = useCallback(() => {
    try {
      if (
        !audioContextRef.current ||
        audioContextRef.current.state === "closed"
      ) {
        audioContextRef.current = createAudioContext();
      }

      const ctx = audioContextRef.current;
      if (!ctx) return;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // صدای Space Coin Win - سکه فضایی
      // نت‌های سریع با افکت shimmer
      const notes = [
        { freq: 1319, start: 0, duration: 0.06 }, // E6
        { freq: 1568, start: 0.05, duration: 0.06 }, // G6
        { freq: 2093, start: 0.1, duration: 0.06 }, // C7
        { freq: 2637, start: 0.15, duration: 0.12 }, // E7
      ];

      notes.forEach(({ freq, start, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "square";
        osc.frequency.setValueAtTime(freq, now + start);
        // افکت shimmer - فرکانس کمی بالا پایین میره
        osc.frequency.setValueAtTime(freq * 1.02, now + start + duration * 0.5);

        gain.gain.setValueAtTime(0.12, now + start);
        gain.gain.exponentialRampToValueAtTime(0.01, now + start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + start);
        osc.stop(now + start + duration);
      });

      // ویبره برای موبایل
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    } catch {
      // خطا رو نادیده بگیر
    }
  }, []);

  return { playFollowSound };
}
