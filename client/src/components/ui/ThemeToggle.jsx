// ─── ThemeToggle ──────────────────────────────────────────────────────────────
import { motion } from 'framer-motion';
import { useDarkMode } from '../../hooks/useDarkMode.js';

export default function ThemeToggle() {
  const [dark, setDark] = useDarkMode();

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => setDark(d => !d)}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="p-2 rounded-full bg-gray-700/60 hover:bg-gray-600/80 text-gray-300 hover:text-white transition-colors text-lg"
    >
      {dark ? '☀️' : '🌙'}
    </motion.button>
  );
}
