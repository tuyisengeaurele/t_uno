// ─── Server Entry Point ───────────────────────────────────────────────────────
import express    from 'express';
import http       from 'http';
import { Server } from 'socket.io';
import cors       from 'cors';
import healthRouter        from './routes/health.js';
import { registerGameHandlers } from './sockets/gameHandler.js';

const PORT   = process.env.PORT || 3001;
const CLIENT = process.env.CLIENT_URL || 'http://localhost:5173';

// ── Express ───────────────────────────────────────────────────────────────────
const app = express();
app.use(cors({ origin: CLIENT, credentials: true }));
app.use(express.json());
app.use('/api', healthRouter);

// ── HTTP + Socket.IO ──────────────────────────────────────────────────────────
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: CLIENT, methods: ['GET', 'POST'] },
  transports: ['websocket', 'polling'],
});

io.on('connection', socket => {
  console.log(`[socket] connected  ${socket.id}`);
  registerGameHandlers(io, socket);
  socket.on('disconnect', () => console.log(`[socket] disconnected ${socket.id}`));
});

// ── Start ─────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`🚀 UNO server running on http://localhost:${PORT}`);
});
