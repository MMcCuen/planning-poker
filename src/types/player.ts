export type PlayerRole = 'dealer' | 'voter' | 'observer';

export interface Player {
  id: string; // nanoid
  sessionId: string;
  name: string; // Display name (Phase 1: manual, Phase 2: from Jira)
  role: PlayerRole;
  isConnected: boolean; // WebSocket connection status
  joinedAt: string; // ISO string
  lastSeenAt: string; // ISO string
  avatarUrl?: string; // Phase 2: from Jira
}
