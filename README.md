# 🃏 UNO — Card Game

A fully playable UNO card game with **single-player AI** and **real-time online multiplayer**.

Built as a portfolio project using a modern JavaScript stack.

---

## ✨ Features

| Feature | Status |
|---|---|
| Single Player vs 1–3 AI bots | ✅ |
| Online Multiplayer (room codes) | ✅ |
| Full UNO rules (skip, reverse, +2, wild, +4) | ✅ |
| Real-time game state via Socket.IO | ✅ |
| Animated card play (Framer Motion) | ✅ |
| Color picker for Wild cards | ✅ |
| Turn timer (30 s) with auto-draw | ✅ |
| UNO! call button | ✅ |
| Procedural sound effects | ✅ |
| Dark / Light mode | ✅ |
| Session score tracking | ✅ |
| Responsive design (desktop-first) | ✅ |

---

## 🧱 Tech Stack

**Frontend**
- React 19 + Vite
- Tailwind CSS v4
- Framer Motion
- Zustand (state management)
- React Router v7
- Socket.IO client

**Backend**
- Node.js + Express
- Socket.IO
- In-memory room store (Redis-ready)

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Install all dependencies

```bash
# From project root
npm run install:all
```

### Run in development

```bash
# Starts both client (port 5173) and server (port 3001) concurrently
npm run dev
```

Or run separately:

```bash
# Terminal 1 — server
cd server && npm run dev

# Terminal 2 — client
cd client && npm run dev
```

### Environment (server)

Copy and edit the example env file:

```bash
cp server/.env.example server/.env
```

---

## 📂 Project Structure

```
t_uno/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── card/        # UnoCard, DrawPile, DiscardPile, PlayerHand, OpponentHand
│       │   ├── table/       # GameTable layout
│       │   ├── hud/         # GameHUD, TurnTimer
│       │   └── ui/          # ColorPicker, WinnerModal, UnoButton, Toast, ThemeToggle
│       ├── pages/           # HomePage, GamePage, LobbyPage, MultiplayerGamePage
│       ├── store/           # gameStore.js (Zustand), multiplayerStore.js
│       ├── hooks/           # useDarkMode
│       └── utils/           # deck.js, gameEngine.js, aiPlayer.js, sounds.js
│
└── server/                  # Express + Socket.IO backend
    ├── models/              # Room.js, gameEngine.js
    ├── routes/              # health.js
    ├── sockets/             # gameHandler.js
    └── index.js
```

---

## 🎮 How to Play

1. Open `http://localhost:5173`
2. Choose **Single Player** and pick 1–3 AI bots, or
3. Choose **Multiplayer**, create a room, share the 6-character code
4. Match cards by **color** or **number/symbol**
5. Use **Wild** cards to change the color
6. First player to empty their hand wins!

---

## 🤖 AI Strategy

The AI opponents follow a priority-based strategy:
1. Play action cards (skip, reverse, +2) matching current color
2. Play number cards matching current color
3. Play any off-color matching card
4. Play Wild (choosing most common color in hand)
5. Play Wild +4 (last resort)
6. Draw if no playable cards

---

## 📄 License

MIT
