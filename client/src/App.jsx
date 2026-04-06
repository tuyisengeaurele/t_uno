// ─── App — Route Definitions ──────────────────────────────────────────────────
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage             from './pages/HomePage.jsx';
import GamePage             from './pages/GamePage.jsx';
import LobbyPage            from './pages/LobbyPage.jsx';
import MultiplayerGamePage  from './pages/MultiplayerGamePage.jsx';
import LeaderboardPage      from './pages/LeaderboardPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                  element={<HomePage />} />
        <Route path="/game"              element={<GamePage />} />
        <Route path="/lobby"             element={<LobbyPage />} />
        <Route path="/multiplayer-game"  element={<MultiplayerGamePage />} />
        <Route path="/leaderboard"       element={<LeaderboardPage />} />
        <Route path="*"                  element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
