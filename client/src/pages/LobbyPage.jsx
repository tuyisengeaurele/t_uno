// ─── Lobby Page ───────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMultiplayerStore } from '../store/multiplayerStore.js';

export default function LobbyPage() {
  const navigate = useNavigate();

  const { connected, roomCode, players, myId, phase, error } = useMultiplayerStore();
  const connect    = useMultiplayerStore(s => s.connect);
  const createRoom = useMultiplayerStore(s => s.createRoom);
  const joinRoom   = useMultiplayerStore(s => s.joinRoom);
  const startGame  = useMultiplayerStore(s => s.startGame);
  const disconnect = useMultiplayerStore(s => s.disconnect);
  const clearError = useMultiplayerStore(s => s.clearError);

  const [name,    setName]    = useState('');
  const [code,    setCode]    = useState('');
  const [tab,     setTab]     = useState('create'); // 'create' | 'join'
  const [copied,  setCopied]  = useState(false);

  // Navigate to multiplayer game when server says game started
  useEffect(() => {
    if (phase === 'playing') navigate('/multiplayer-game');
  }, [phase]);

  function handleConnect(action) {
    if (!name.trim()) return;
    connect(name.trim());
    // Wait for socket to connect then emit
    const s = useMultiplayerStore.getState().socket;
    s?.once('connect', () => {
      if (action === 'create') createRoom();
      else joinRoom(code.trim());
    });
    // Fallback if already connected
    setTimeout(() => {
      if (useMultiplayerStore.getState().connected) {
        if (action === 'create') createRoom();
        else if (code.trim()) joinRoom(code.trim());
      }
    }, 800);
  }

  function copyCode() {
    navigator.clipboard.writeText(roomCode ?? '').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const isHost = players[0]?.id === myId;
  const canStart = isHost && players.length >= 2;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 px-4">

      {/* Back button */}
      <button
        onClick={() => { disconnect(); navigate('/'); }}
        className="absolute top-4 left-4 text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors"
      >
        ← Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm flex flex-col gap-5"
      >
        <div className="text-center">
          <h1 className="text-white font-black text-3xl">Multiplayer</h1>
          <p className="text-gray-400 text-sm mt-1">Create or join a room</p>
        </div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              onClick={clearError}
              className="bg-red-500/20 border border-red-500/50 text-red-300 text-sm px-4 py-2 rounded-xl cursor-pointer"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Before joining a room ─── */}
        {phase === 'idle' && (
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 flex flex-col gap-4">
            {/* Name input */}
            <div>
              <label className="text-gray-400 text-sm font-medium mb-1 block">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
                maxLength={16}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Tab switcher */}
            <div className="flex bg-gray-700/60 rounded-xl p-1">
              {['create','join'].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={[
                    'flex-1 py-2 rounded-lg font-semibold text-sm capitalize transition-all',
                    tab === t ? 'bg-white text-gray-900 shadow' : 'text-gray-400 hover:text-gray-200',
                  ].join(' ')}
                >
                  {t === 'create' ? '🏠 Create Room' : '🔑 Join Room'}
                </button>
              ))}
            </div>

            {/* Join code input */}
            {tab === 'join' && (
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="Room Code (e.g. AB12CD)"
                maxLength={6}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-2.5 text-sm uppercase tracking-widest text-center focus:outline-none focus:border-blue-500 transition-colors"
              />
            )}

            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => handleConnect(tab)}
              disabled={!name.trim() || (tab === 'join' && !code.trim())}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-black py-3 rounded-xl text-sm transition-colors shadow-lg"
            >
              {tab === 'create' ? 'Create Room' : 'Join Room'}
            </motion.button>
          </div>
        )}

        {/* ─── Lobby room ─── */}
        {phase === 'lobby' && roomCode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 border border-gray-700 rounded-2xl p-5 flex flex-col gap-4"
          >
            {/* Room code */}
            <div className="text-center">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">Room Code</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-white font-black text-3xl tracking-[0.3em]">{roomCode}</span>
                <button
                  onClick={copyCode}
                  className="text-gray-400 hover:text-white text-xs bg-gray-700 px-2 py-1 rounded-lg transition-colors"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-1">Share this code with friends</p>
            </div>

            {/* Players list */}
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-2">
                Players ({players.length}/4)
              </p>
              <div className="flex flex-col gap-2">
                <AnimatePresence>
                  {players.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between bg-gray-700/50 px-3 py-2 rounded-xl"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-white text-sm font-medium">{p.name}</span>
                        {p.id === myId && <span className="text-gray-500 text-xs">(you)</span>}
                      </div>
                      {i === 0 && <span className="text-yellow-400 text-xs font-bold">HOST</span>}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Start button (host only) */}
            {isHost ? (
              <motion.button
                whileHover={canStart ? { scale: 1.03 } : {}}
                whileTap={canStart ? { scale: 0.97 } : {}}
                onClick={startGame}
                disabled={!canStart}
                className="w-full bg-green-500 hover:bg-green-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-black py-3 rounded-xl text-sm transition-colors shadow-lg"
              >
                {canStart ? '🚀 Start Game' : `Waiting for players… (${players.length}/2 min)`}
              </motion.button>
            ) : (
              <p className="text-center text-gray-400 text-sm animate-pulse">
                Waiting for host to start…
              </p>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
