// ─── Toast Notification ────────────────────────────────────────────────────────
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

export default function Toast({ message, onDismiss, duration = 2500 }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [message]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0,  scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          onClick={onDismiss}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-700 border border-gray-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-xl cursor-pointer select-none"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
