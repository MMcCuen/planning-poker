// Socket.io event name constants
// Ensures type safety and consistency across client/server

export const SOCKET_EVENTS = {
  // Connection
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',

  // Session events
  SESSION_JOIN: 'session:join',
  SESSION_LEAVE: 'session:leave',
  SESSION_END: 'session:end',
  SESSION_UPDATED: 'session:updated',
  SESSION_ENDED: 'session:ended',

  // Player events
  PLAYER_JOINED: 'player:joined',
  PLAYER_LEFT: 'player:left',
  PLAYER_UPDATED: 'player:updated',

  // Voting events
  VOTE_SUBMIT: 'vote:submit',
  VOTE_REVEAL: 'vote:reveal',
  VOTE_RESET: 'vote:reset',
  VOTE_NEXT_ISSUE: 'vote:next-issue',
  VOTING_SUBMITTED: 'voting:submitted',
  VOTING_REVEALED: 'voting:revealed',
  VOTING_RESET: 'voting:reset',

  // Error events
  ERROR: 'error',
} as const;

export type SocketEvent = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];
