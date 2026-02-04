import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from '@/types/socket';
import { getSessionStore } from '@/lib/redis/session-store';
import { handleSessionEvents } from './handlers/session';
import { handleVotingEvents } from './handlers/voting';

let io: SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> | null = null;

export function initializeSocketServer(
  httpServer: HTTPServer
): SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> {
  if (io) {
    return io;
  }

  io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      credentials: true,
    },
    path: '/api/socket',
  });

  const sessionStore = getSessionStore();

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Register event handlers
    handleSessionEvents(io!, socket, sessionStore);
    handleVotingEvents(io!, socket, sessionStore);

    // Disconnect handler
    socket.on('disconnect', async () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);

      const { sessionId, playerId } = socket.data;

      if (sessionId && playerId) {
        try {
          // Mark player as disconnected
          await sessionStore.updatePlayerConnection(sessionId, playerId, false);

          // Notify other players
          const player = await sessionStore.getPlayer(sessionId, playerId);
          if (player) {
            socket.to(sessionId).emit('player:updated', { ...player, isConnected: false });
          }
        } catch (error) {
          console.error('[Socket.io] Error handling disconnect:', error);
        }
      }
    });
  });

  console.log('[Socket.io] Server initialized');

  return io;
}

export function getIO():
  | SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
  | null {
  return io;
}
