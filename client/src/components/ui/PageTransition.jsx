// ─── PageTransition ───────────────────────────────────────────────────────────
// Wraps each page in a smooth fade+slide entrance animation.
import { motion } from 'framer-motion';

const variants = {
  initial: { opacity: 0, y: 16 },
  enter:   { opacity: 1, y: 0,  transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.2, ease: 'easeIn' } },
};

export default function PageTransition({ children }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="enter"
      exit="exit"
      className="flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}
