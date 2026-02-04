import type { Server, Socket } from 'socket.io';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from '@/types/socket';
import type { SessionStore } from '@/lib/redis/session-store';
import { SOCKET_EVENTS } from '@/lib/constants/socket-events';

export function handleSessionEvents(
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  sessionStore: SessionStore
) {
  // Join session
  socket.on(SOCKET_EVENTS.SESSION_JOIN, async (sessionId, playerName, role) => {
    try {
      // Verify session exists
      const session = await sessionStore.getSession(sessionId);
      if (!session) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND',
        });
        return;
      }

      // Check if player already exists (reconnecting)
      let player = await sessionStore.getPlayer(sessionId, socket.id);

      if (!player) {
        // Create new player
        player = await sessionStore.addPlayer(sessionId, playerName, role);

        // If this is the first player or they specified dealer role, make them dealer
        const players = await sessionStore.getPlayers(sessionId);
        if (players.length === 1 || role === 'dealer') {
          await sessionStore.updateSession(sessionId, { dealerId: player.id });
        }
      } else {
        // Reconnecting player
        await sessionStore.updatePlayerConnection(sessionId, player.id, true);
      }

      // Store session and player data in socket
      socket.data.sessionId = sessionId;
      socket.data.playerId = player.id;
      socket.data.playerName = playerName;

      // Join Socket.io room
      await socket.join(sessionId);

      // Get updated session and all players
      const updatedSession = await sessionStore.getSession(sessionId);
      const allPlayers = await sessionStore.getPlayers(sessionId);

      // Send session state to joining player
      if (updatedSession) {
        socket.emit(SOCKET_EVENTS.SESSION_UPDATED, updatedSession);
      }

      // Send all players to joining player
      for (const p of allPlayers) {
        socket.emit(SOCKET_EVENTS.PLAYER_JOINED, p);
      }

      // Notify other players
      socket.to(sessionId).emit(SOCKET_EVENTS.PLAYER_JOINED, player);

      console.log(`[Session] Player ${playerName} (${player.id}) joined session ${sessionId}`);
    } catch (error) {
      console.error('[Session] Error joining session:', error);
      socket.emit(SOCKET_EVENTS.ERROR, {
        message: 'Failed to join session',
        code: 'JOIN_FAILED',
      });
    }
  });

  // Leave session
  socket.on(SOCKET_EVENTS.SESSION_LEAVE, async () => {
    const { sessionId, playerId } = socket.data;

    if (!sessionId || !playerId) {
      return;
    }

    try {
      // Mark player as disconnected
      await sessionStore.updatePlayerConnection(sessionId, playerId, false);

      // Leave Socket.io room
      await socket.leave(sessionId);

      // Notify other players
      socket.to(sessionId).emit(SOCKET_EVENTS.PLAYER_LEFT, playerId);

      // Clear socket data
      socket.data.sessionId = undefined;
      socket.data.playerId = undefined;
      socket.data.playerName = undefined;

      console.log(`[Session] Player ${playerId} left session ${sessionId}`);
    } catch (error) {
      console.error('[Session] Error leaving session:', error);
    }
  });

  // End session (dealer only)
  socket.on(SOCKET_EVENTS.SESSION_END, async () => {
    const { sessionId, playerId } = socket.data;

    if (!sessionId || !playerId) {
      socket.emit(SOCKET_EVENTS.ERROR, {
        message: 'Not in a session',
        code: 'NOT_IN_SESSION',
      });
      return;
    }

    try {
      const session = await sessionStore.getSession(sessionId);

      if (!session) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND',
        });
        return;
      }

      // Verify dealer permission
      if (session.dealerId !== playerId) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'Only the dealer can end the session',
          code: 'PERMISSION_DENIED',
        });
        return;
      }

      // Update session status
      await sessionStore.updateSession(sessionId, { status: 'completed' });

      // Notify all players
      io.to(sessionId).emit(SOCKET_EVENTS.SESSION_ENDED);

      // Clean up session data (optional - let TTL handle it)
      // await sessionStore.deleteSession(sessionId);

      console.log(`[Session] Session ${sessionId} ended by dealer ${playerId}`);
    } catch (error) {
      console.error('[Session] Error ending session:', error);
      socket.emit(SOCKET_EVENTS.ERROR, {
        message: 'Failed to end session',
        code: 'END_FAILED',
      });
    }
  });
}
