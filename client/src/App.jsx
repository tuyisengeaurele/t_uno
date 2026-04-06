// ─── App — Route Definitions ──────────────────────────────────────────────────
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import HomePage             from './pages/HomePage.jsx';
import GamePage             from './pages/GamePage.jsx';
import LobbyPage            from './pages/LobbyPage.jsx';
import MultiplayerGamePage  from './pages/MultiplayerGamePage.jsx';
import LeaderboardPage      from './pages/LeaderboardPage.jsx';
import PageTransition       from './components/ui/PageTransition.jsx';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"                 element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/game"             element={<PageTransition><GamePage /></PageTransition>} />
        <Route path="/lobby"            element={<PageTransition><LobbyPage /></PageTransition>} />
        <Route path="/multiplayer-game" element={<PageTransition><MultiplayerGamePage /></PageTransition>} />
        <Route path="/leaderboard"      element={<PageTransition><LeaderboardPage /></PageTransition>} />
        <Route path="*"                 element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
