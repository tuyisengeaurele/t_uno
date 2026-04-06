// ─── TurnTimer ────────────────────────────────────────────────────────────────
// Countdown ring shown only on the human's turn.
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const SECONDS = 30;
const RADIUS  = 20;
const CIRCUM  = 2 * Math.PI * RADIUS;

export default function TurnTimer({ active, onTimeout }) {
  const [remaining, setRemaining] = useState(SECONDS);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!active) {
      setRemaining(SECONDS);
      clearInterval(intervalRef.current);
      return;
    }
    setRemaining(SECONDS);
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onTimeout?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [active]);

  const progress = remaining / SECONDS;
  const dashOffset = CIRCUM * (1 - progress);
  const isUrgent  = remaining <= 10;

  if (!active) return null;

  return (
    <div className="flex items-center justify-center">
      <svg width="52" height="52" className="-rotate-90">
        {/* track */}
        <circle cx="26" cy="26" r={RADIUS} fill="none" stroke="#374151" strokeWidth="4" />
        {/* progress */}
        <motion.circle
          cx="26" cy="26" r={RADIUS}
          fill="none"
          stroke={isUrgent ? '#ef4444' : '#22c55e'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={CIRCUM}
          strokeDashoffset={dashOffset}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 0.8, ease: 'linear' }}
        />
      </svg>
      <span className={[
        'absolute text-xs font-black tabular-nums',
        isUrgent ? 'text-red-400' : 'text-white',
      ].join(' ')}>
        {remaining}
      </span>
    </div>
  );
}
